
//  SVG Terminal server example
//  Copyright 2006 by Liam Breck
//  Licensed under GNU GPL http://gnu.org/licenses/gpl.html
//
//  Home page: http://networkimprov.net/airwrx/awscene.html
//
//  Simple example server app that maintains two SVG documents
//  each of which may be viewed and manipulated by any number of SVGTerms,

#include <windows.h>
#include <stdio.h>

#include "keystate.h"

unsigned short sPort = 8989;
unsigned long sAddr = INADDR_ANY;
static bool sAccepting = true;

static const char sHeader[] = "SVGT/0.2 upd %d\r\n";
static const char sLine1[] = "<svg xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\">\n";
static const char sInput[] = "SVGT/0.2 inp x\r\n";

#define GET_XML_ESC(c) ((c)=='<' ? "&lt;" : (c)=='>' ? "&gt;" : (c)=='&' ? "&amp;" : 0)

struct ExTbuf {
	ExTbuf* next;
	char t[1024];
	int len;
	int id;
	int tspanId;
	int x,y;
};

struct ExSet {
	char head[128];
	char doc[256*1024]; // an svg doc
	int docN; // end of doc
	int translateX, translateY;
	int nextId;
	ExTbuf* tbufList;
	enum { eToolHl=12, eCircle, eEllipse, eRect, eLine, ePath, eText, eMove, eShapes=20 };
	enum { kTools=505 };

	void Init(int iLabel) {
		// print the demo instructions in a multiline text element
		char aMsg[] =
			"<g id=\"0\" prev=\"-1\" transform=\"translate(%4d,%4d)\"/>\n"
			"<text id=\"1\" prev=\"-1\" parent=\"0\" x=\"20\" y=\"20\">\n"
			"<tspan>Demo app for SVG Terminal.</tspan>\n"
			"<tspan x=\"20\" dy=\"20\">The app creates all the SVG for this view,</tspan>\n"
			"<tspan x=\"30\" dy=\"20\">and handles all mouse and keyboard input.</tspan>\n"
			"<tspan x=\"20\" dy=\"20\">The SVG Terminal module applies updates from</tspan>\n"
			"<tspan x=\"30\" dy=\"20\">the app to the DOM, and hands user input to the app.</tspan>\n"
			"<tspan x=\"20\" dy=\"40\">Scene %d.</tspan>\n"
			"<tspan x=\"20\" dy=\"20\">Select a tool and drag to create an object.</tspan>\n"
			"<tspan x=\"20\" dy=\"20\">Select the arrow tool to highlight text.</tspan>\n"
			"<tspan x=\"20\" dy=\"20\">Tab to switch scene. Use arrows to nudge scene.</tspan>\n"
			"<tspan x=\"20\" dy=\"20\">Any number of Firefox windows may access the scenes.</tspan>\n"
			"</text>\n"
			"<text id=\"2\" prev=\"1\" x=\"100\" y=\"140\"/>\n"
			"<rect id=\"3\" prev=\"2\" x=\"500\" y=\"20\" width=\"350\" height=\"50\" "
				"stroke=\"gray\" stroke-width=\"2\" fill=\"none\"/>\n"
			"<circle id=\"4\" prev=\"3\" cx=\"525\" cy=\"45\" r=\"15\" "
				"stroke=\"none\" fill=\"yellow\"/>\n"
			"<ellipse id=\"5\" prev=\"4\" cx=\"575\" cy=\"45\" ry=\"10\" rx=\"20\" "
				"stroke=\"none\" fill=\"lightgreen\"/>\n"
			"<rect id=\"6\" prev=\"5\" x=\"610\" y=\"30\" width=\"30\" height=\"30\" "
				"stroke=\"none\" fill=\"tan\"/>\n"
			"<line id=\"7\" prev=\"6\" x1=\"660\" y1=\"30\" x2=\"690\" y2=\"60\" "
				"stroke-width=\"5\" stroke=\"blue\"/>\n"
			"<path id=\"8\" prev=\"7\" d=\"M710 30 l30 0 c0 30 -15 15 -30 30 Z\" "
				"stroke=\"none\" fill=\"orange\"/>\n"
			"<rect id=\"9\" prev=\"8\" x=\"760\" y=\"30\" width=\"30\" height=\"30\" "
				"stroke=\"none\" fill=\"lightgray\"/>\n"
			"<text id=\"10\" prev=\"9\" x=\"765\" y=\"55\" "
				"font-family=\"times\" font-size=\"28\">A</text>\n"
			"<path id=\"11\" prev=\"10\" d=\"M826 32 l6.5 15 l-5 0 l0 10 l-3 0 l0 -10 l-5 0 Z\" "
				"stroke=\"none\" fill=\"dimgray\"/>\n"
			"<rect id=\"12\" prev=\"11\" x=\"505\" y=\"25\" width=\"40\" height=\"40\" "
				"stroke=\"lightgray\" stroke-width=\"2\" fill=\"none\"/>\n"
			"<rect id=\"13\" prev=\"12\" x=\"500\" y=\"20\" width=\"50\" height=\"50\" "
				"opacity=\"0\"/>\n"
			"<rect id=\"14\" prev=\"13\" x=\"550\" y=\"20\" width=\"50\" height=\"50\" "
				"opacity=\"0\"/>\n"
			"<rect id=\"15\" prev=\"14\" x=\"600\" y=\"20\" width=\"50\" height=\"50\" "
				"opacity=\"0\"/>\n"
			"<rect id=\"16\" prev=\"15\" x=\"650\" y=\"20\" width=\"50\" height=\"50\" "
				"opacity=\"0\"/>\n"
			"<rect id=\"17\" prev=\"16\" x=\"700\" y=\"20\" width=\"50\" height=\"50\" "
				"opacity=\"0\"/>\n"
			"<rect id=\"18\" prev=\"17\" x=\"750\" y=\"20\" width=\"50\" height=\"50\" "
				"opacity=\"0\"/>\n"
			"<rect id=\"19\" prev=\"18\" x=\"800\" y=\"20\" width=\"50\" height=\"50\" "
				"opacity=\"0\"/>\n"
			;
		docN = _snprintf(doc, sizeof(doc), aMsg, translateX, translateY, iLabel);
		nextId = eShapes;
		tbufList = 0;
	}

	void addTbuf(int iId, int iX, int iY) {
		ExTbuf* aB = new ExTbuf;
		aB->next = tbufList;
		tbufList = aB;
		aB->t[0] = 0;
		aB->len = 0;
		aB->id = iId;
		aB->tspanId = 0;
		aB->x = iX;
		aB->y = iY;
	}
};
static ExSet s1, s2; // app provides two scenes

class ExView {
public:
	static ExView* sListHead;
	static int sN;

	ExSet* mS; // id of the scene showing in the view
	SOCKET mSock; // connection to firefox
	char mHead[128];
	char mBuf[1024];
	int mBufN;
	int mId;
	AwKeyState mKeystate;
	bool mDrag;
	int mDownX, mDownY;
	int mTarget;
	int mShapeId;
	int mTool;
	ExTbuf* mTbuf;
	ExView* mNext;

	ExView(SOCKET iSock = -1) {
		mSock = iSock;
		mNext = sListHead;
		sListHead = this;
		mS = &s1;
		mId = ++sN;
		mKeystate.init();
		mDrag = false;
		mShapeId = 0;
		setTerm();
	}

	~ExView() {
		// linked list housekeeping
		if (sListHead == this)
			sListHead = mNext;
		else
			for (ExView *aPrev, *a = sListHead; a; aPrev = a, a = a->mNext)
				if (a == this)
					aPrev->mNext = mNext;
	}

	void setTerm() {
		sendUpdate(mS->head, sizeof(mS->head), mS->docN);

		mTool = ExSet::eCircle;
		mTbuf = mS->tbufList;
		// label this view in the view-specific set already created
		int aLen = _snprintf(mBuf, sizeof(mBuf),
			"<text id=\"2\" offset=\"0\" replace=\"20\">View no. %d</text>", mId);
		sendUpdate(mHead, sizeof(mHead), aLen);

		for (ExTbuf* aB = mS->tbufList; aB; aB = aB->next) {
			aLen = 0;
			for (int aC=0, aId=0; aId <= aB->tspanId; ++aId, ++aC) {
				aLen += _snprintf(mBuf+aLen, sizeof(mBuf)-aLen,
					"<text id=\"%d-%d\" offset=\"end\">", aB->id, aId);
				while (aC < aB->len && aB->t[aC] != '\n') {
					char* aSt = GET_XML_ESC(aB->t[aC]);
					if (aSt)
						while (*aSt != 0) mBuf[aLen++] = *aSt++;
					else
						mBuf[aLen++] = aB->t[aC];
					++aC;
				}
				aLen += _snprintf(mBuf+aLen, sizeof(mBuf)-aLen, "</text>\n");
			}
			aLen += _snprintf(mBuf+aLen, sizeof(mBuf)-aLen,
				"<rect id=\"%d-r\" prev=\"%d\" sizeto=\"%d\" atupdate=\"\"/>\n",
				aB->id, aB->id-1, aB->id);
			sendUpdate(mHead, sizeof(mHead), aLen);
		}
	}

	void updateAll() {
		// send changed and new elements to all svgterms

		for (ExView* aV = sListHead; aV; aV = aV->mNext) {
			// prepare updates for terms of this scene
			if (aV->mS != mS)
				continue;
			aV->sendUpdate(mHead, sizeof(mHead), mBufN);
		}
	}

	void sendUpdate(char* oHead, size_t iLenH, int iLen) {
		int aLine1N = sizeof(sLine1)-1;
		int aLen = _snprintf(oHead, iLenH, sHeader, iLen+aLine1N+6);
		char* aStart = oHead+iLenH - aLine1N - aLen;
		memmove(aStart, oHead, aLen);
		memcpy(aStart+aLen, sLine1, aLine1N);
		memcpy(oHead+iLenH+iLen, "</svg>", 6);
		::send(mSock, aStart, aLen+aLine1N+iLen+6, 0);
		//printf("%.*s\n", aLen+aLine1N+iLen+6, aStart);
	}

	enum {
		eBUTTONDOWN, eBUTTONUP, eMOUSEMOVE, eRESIZE,
		eKEYDOWN, eKEYUP
	};

	void handleInput(char* iBuf) {
		if (strncmp(iBuf, sInput, sizeof(sInput)-4)) {
			printf("Input header invalid\n");
			return;
		}
		char* aNext = iBuf + sizeof(sInput)-4;
		if (!strncmp(aNext, "hello\r\n", 7)
		 || !strncmp(aNext, "bye\r\n", 5))
			return;
		int aType = strtoul(aNext,  &aNext, 10);
		int aKey, aX, aY, aTarget;
		if (aType == eKEYUP || aType == eKEYDOWN) {
			aKey = strtoul(aNext+1, &aNext, 10);
			if (aKey == VK_SUBTRACT)
				aKey = VK_OEM_MINUS;
			else if (aKey == 0x3d)
				aKey = VK_OEM_PLUS;
			else if (aKey == 0x3b)
				aKey = VK_OEM_1;
		} else {
			aX   = strtoul(aNext+1, &aNext, 10) - mS->translateX;
			aY   = strtoul(aNext+1, &aNext, 10) - mS->translateY;
			aTarget = strtoul(aNext+1, &aNext, 10);
		}

		switch (aType) {

		case eBUTTONDOWN: {
			// now dragging on bg
			mDrag = true;
			mDownX = aX;
			mDownY = aY;
			mTarget = aTarget;
			} break;

		case eMOUSEMOVE:
		case eBUTTONUP: {
			if (!mDrag)
				break;
			if (aType == eBUTTONUP)
				mDrag = false;

			if (mTarget >= ExSet::eCircle && mTarget <= ExSet::eMove) {
				if (aTarget >= ExSet::eCircle && aTarget <= ExSet::eMove) {
					mBufN = _snprintf(mBuf, sizeof(mBuf),
						"<rect id=\"%d\" x=\"%d\" atupdate=\"\"/>\n",
						ExSet::eToolHl, ExSet::kTools+50*(aTarget-ExSet::eCircle));
					sendUpdate(mHead, sizeof(mHead), mBufN);
					mTool = mTarget;
				}
				break;
			} else if (mTool == ExSet::eMove) {
				ExTbuf* aB;
				for (aB = mS->tbufList; aB; aB = aB->next)
					if (mTarget == aB->id)
						break;
				if (aB) {
					mBufN = _snprintf(mBuf, sizeof(mBuf),
						"<text id=\"%d\" select=\"%d %d %d %d\" hlid=\"%d-h\"/>\n",
						aB->id, mDownX, mDownY, aX, aY, aB->id);
					sendUpdate(mHead, sizeof(mHead), mBufN);
					mTbuf = aB;
				}
				break;
			}
			// user dragged on bg; draw a shape

			int aOrigaX=mDownX, aOrigaY=mDownY, aOrigbX=aX, aOrigbY=aY;
			if (aX < mDownX)
				mDownX = aX, aX = aOrigaX;
			if (aY < mDownY)
				mDownY = aY, aY = aOrigaY;
			int aW = aX - mDownX;
			int aH = aY - mDownY;
			if (aW <= 10 && aH <= 10)
				break;

			if (mShapeId == 0)
				mShapeId = mS->nextId++;

			switch (mTool) {
			case ExSet::eCircle:
				mBufN = _snprintf(mBuf, sizeof(mBuf),
					"<circle id=\"%d\" prev=\"%d\" cx=\"%d\" cy=\"%d\" r=\"%d\" stroke=\"blue\" fill=\"yellow\"/>",
					mShapeId, mShapeId-1, mDownX+aW/2, mDownY+aH/2, (aW > aH ? aW : aH) / 2);
				break;
			case ExSet::eRect:
				mBufN = _snprintf(mBuf, sizeof(mBuf),
					"<rect id=\"%d\" prev=\"%d\" x=\"%d\" y=\"%d\" width=\"%d\" height=\"%d\" stroke=\"green\" fill=\"tan\"/>",
					mShapeId, mShapeId-1, mDownX, mDownY, aW, aH);
				break;
			case ExSet::eEllipse:
				mBufN = _snprintf(mBuf, sizeof(mBuf),
					"<ellipse id=\"%d\" prev=\"%d\" cx=\"%d\" cy=\"%d\" rx=\"%d\" ry=\"%d\" stroke=\"blue\" fill=\"lightgreen\"/>",
					mShapeId, mShapeId-1, mDownX+aW/2, mDownY+aH/2, aW/2, aH/2);
				break;
			case ExSet::ePath:
				mBufN = _snprintf(mBuf, sizeof(mBuf),
					"<path id=\"%d\" prev=\"%d\" d=\"M%d %d L%d %d C%d %d %d %d %d %d Z\" stroke=\"gray\" fill=\"orange\"/>",
					mShapeId, mShapeId-1, mDownX, mDownY, aX, mDownY, aX, aY, mDownX+aW/2, mDownY+aH/2, mDownX, aY);
				break;
			case ExSet::eLine:
				mBufN = _snprintf(mBuf, sizeof(mBuf),
					"<line id=\"%d\" prev=\"%d\" x1=\"%d\" y1=\"%d\" x2=\"%d\" y2=\"%d\" stroke-width=\"10\" stroke=\"blue\" fill=\"yellow\"/>",
					mShapeId, mShapeId-1, aOrigaX, aOrigaY, aOrigbX, aOrigbY);
				break;
			case ExSet::eText:
				mBufN = _snprintf(mBuf, sizeof(mBuf),
					"<rect id=\"%d-r\" prev=\"%d\" x=\"%d\" y=\"%d\" width=\"%d\" height=\"%d\" fill=\"lightgray\"/>",
					mShapeId, mShapeId-1, mDownX, mDownY, aW, aH);
				break;
			//case ExSet::eImage:
			//	mBufN = _snprintf(mBuf, sizeof(mBuf),
			//		"<image id=\"%d\" prev=\"%d\" x=\"%d\" y=\"%d\" width=\"%d\" height=\"%d\" src=\"\" stroke=\"blue\" fill=\"yellow\"/>",
			//		mShapeId, mShapeId-1, mDownX, mDownY, 10, 10);
			//	break;
			}
			mBuf[mBufN++] = '\n';
			if (aType == eBUTTONUP) {
				if (mTool == ExSet::eText) {
					mS->addTbuf(mShapeId, mDownX, mDownY);
					mTbuf = mS->tbufList;
					mBufN += _snprintf(mBuf+mBufN, sizeof(mBuf)-mBufN,
						"<g id=\"%d\" prev=\"%d-r\" tag=\"text\" fill=\"dimgray\"><text id=\"%d-0\" x=\"%d\" y=\"%d\"/></g>\n",
						mShapeId, mShapeId, mShapeId, mDownX, mDownY);
				}
				if (mS->docN+mBufN < sizeof(mS->doc)) {
					memcpy(mS->doc+mS->docN, mBuf, mBufN);
					mS->docN += mBufN;
				}
				mShapeId = 0;
				updateAll(); // update all views
			} else {
				sendUpdate(mHead, sizeof(mHead), mBufN);
			}
			} break;

		case eKEYUP: {
			Input aIn;
			aIn.key.code = aKey;
			aIn.key.updn = Input::eKup;
			mKeystate.FillinChar(&aIn);
			} break;

		case eKEYDOWN: {
			Input aIn;
			aIn.key.code = aKey;
			aIn.key.updn = Input::eKdown;
			mKeystate.FillinChar(&aIn);
			if (aIn.key.unichar == 0)
				break;

			if (aIn.key.code == VK_TAB) {
				mS = mS==&s1 ? &s2 : &s1;
				setTerm();
				break;
			}
			bool aTyping = false;
			switch (aIn.key.code) {
			case VK_UP:    mS->translateY -= 10; break;
			case VK_DOWN:  mS->translateY += 10; break;
			case VK_LEFT:  mS->translateX -= 10; break;
			case VK_RIGHT: mS->translateX += 10; break;
			default: aTyping = true;
			}
			if (aTyping) {
				if (!mTbuf)
					break;
				if (aIn.key.code == VK_RETURN) {
					mTbuf->t[mTbuf->len++] = '\n';
					mBufN = _snprintf(mBuf, sizeof(mBuf),
						"<text id=\"%d-%d\" prev=\"%d-%d\" xy=\"\"/>\n",
						mTbuf->id, mTbuf->tspanId+1, mTbuf->id, mTbuf->tspanId);
					++mTbuf->tspanId;
					if (mS->docN+mBufN < sizeof(mS->doc)) {
						memcpy(mS->doc+mS->docN, mBuf, mBufN);
						mS->docN += mBufN;
					}
				} else if (aIn.key.code == VK_BACK) {
					if (mTbuf->len == 0)
						break;
					if (mTbuf->t[--mTbuf->len] == '\n') {
						--mTbuf->tspanId;
						break;
					}
					int aC = mTbuf->len+1;
					while (aC > 0 && mTbuf->t[aC-1] != '\n') aC--;
					mBufN = _snprintf(mBuf, sizeof(mBuf),
						"<text id=\"%d-%d\" offset=\"%d\" replace=\"1\"/>\n",
						mTbuf->id, mTbuf->tspanId, mTbuf->len-aC);
				} else {
					char aSt[]="0", *aXst;
					if (aIn.key.unichar >= 256)
						aIn.key.unichar = ' ';
					mTbuf->t[mTbuf->len++] = aSt[0] = (char)aIn.key.unichar;
					mBufN = _snprintf(mBuf, sizeof(mBuf),
						"<text id=\"%d-%d\" offset=\"end\">%s</text>\n",
						mTbuf->id, mTbuf->tspanId, (aXst=GET_XML_ESC(aSt[0])) ? aXst : aSt);
				}
				mBufN += _snprintf(mBuf+mBufN, sizeof(mBuf)-mBufN,
					"<rect id=\"%d-r\" prev=\"%d\" sizeto=\"%d\" atupdate=\"\"/>\n",
					mTbuf->id, mTbuf->id-1, mTbuf->id);
			} else {
				int aLen = _snprintf(mS->doc, mS->docN,
					"<g id=\"0\" prev=\"-1\" transform=\"translate(%4d,%4d)\"/>",
					mS->translateX, mS->translateY);
				mS->doc[aLen] = '\n';
				mBufN = _snprintf(mBuf, sizeof(mBuf),
					"<g id=\"0\" prev=\"-1\" transform=\"translate(%4d,%4d)\" atupdate=\"\"/>",
					mS->translateX, mS->translateY);
			}
			updateAll(); // update all views
			} break;

		}
	}
};

ExView* ExView::sListHead;
int ExView::sN;

// transport overhead

int main()
{
	s1.Init(1);
	s2.Init(2);

	WSADATA aD;
	WSAStartup(MAKEWORD(1,1), &aD);

	SOCKET mSocket;
	fd_set mPorts;
	FD_ZERO(&mPorts);
	timeval mTimeout;
	mTimeout.tv_sec = 1; mTimeout.tv_usec = 0;

	//.linger li;
	int opt;

	mSocket = ::socket(AF_INET, SOCK_STREAM, IPPROTO_TCP);
	if (mSocket == INVALID_SOCKET)
		return false;
    //opt = ::fcntl(mSocket, F_GETFL, 0);	/* Non-blocking */
    //opt |= O_NONBLOCK;
    //::fcntl(mSocket, F_SETFL, opt);
	opt=1;
	::setsockopt(mSocket, SOL_SOCKET, SO_REUSEADDR, (char*) &opt, sizeof(int));
									// Re-use address
	::setsockopt(mSocket, SOL_SOCKET, SO_KEEPALIVE, (char*) &opt, sizeof(int));
									// Keep alive
	::setsockopt(mSocket, IPPROTO_TCP, TCP_NODELAY, (char*) &opt, sizeof(int));
									// Turn off Nagle delay algorithm
	//. li.l_onoff = 1;
    //. li.l_linger = MAX_SECS_TO_LINGER;
	//. ::setsockopt(mSocket, SOL_SOCKET, SO_LINGER, (char*) &li, sizeof(linger));
	//opt=send_buffer_size;
	//::setsockopt(mSocket, SOL_SOCKET, SO_SNDBUF, (char*) &opt, sizeof(int));

	sockaddr_in addr;
	addr.sin_family = AF_INET;
	addr.sin_port = htons(sPort);
	addr.sin_addr.s_addr = htonl(sAddr);
	if (::bind(mSocket, (sockaddr*) &addr, sizeof(sockaddr_in))) {
		//cout << PostErr() << "LListener::open: bind failed" << endl;
		::closesocket(mSocket);
		mSocket = INVALID_SOCKET;
		return false;
	}
	if (::listen(mSocket, SOMAXCONN)) {
		//cout << PostErr() << "LListener::open: listen failed" << endl;
		::closesocket(mSocket);
		mSocket = INVALID_SOCKET;
		return false;
	}
	FD_SET(mSocket, &mPorts);

	printf("Open svgterm.xml in Firefox 1.5.\n");

	while (true) {
		fd_set aPort;
		int aSel;
		do {
			aPort = mPorts;
			timeval aTimeout = mTimeout;
			aSel = ::select(0, &aPort, NULL, NULL, &aTimeout);
			if (!sAccepting) {
				closesocket(mSocket);
				break;
			}
		} while (aSel <= 0);
		if (!sAccepting) {
			printf("listener closed\n");
			break;
		}
		sockaddr_in aClient;
#ifdef WIN32
		int aClilen = sizeof(sockaddr_in);
#else
		size_t aClilen = sizeof(sockaddr_in);
#endif
		if (FD_ISSET(mSocket, &aPort)) {
			SOCKET aSock = ::accept(mSocket, (sockaddr*) &aClient, &aClilen);
			if (aSock >= 0) {
				printf("connection opened\n");
				int aOpt=1;							// Turn off delay algorithm
				::setsockopt(aSock, IPPROTO_TCP, TCP_NODELAY, (char*) &aOpt, sizeof(int));
				aOpt = 8*1024;
				::setsockopt(aSock, SOL_SOCKET, SO_SNDBUF, (char*) &aOpt, sizeof(int));
				FD_SET(aSock, &mPorts);
				new ExView(aSock);
			}
		} else {
			ExView* aV;
			for (aV = ExView::sListHead; aV; aV = aV->mNext)
				if (FD_ISSET(aV->mSock, &aPort))
					break;
			char aBuf[1024];
			int aLen = recv(aV->mSock, aBuf, 1024, 0);
			if (aLen <= 0) {
				printf("connection closed\n");
				closesocket(aV->mSock);
				FD_CLR(aV->mSock, &mPorts);
				delete aV;
				if (ExView::sListHead == 0)
					sAccepting = false;
			} else {
				for (int a, aTot=0; aLen-aTot > 0; aTot = a+2) {
					for (a = aTot; a < aLen && aBuf[a] != '\r'; ++a) ;
					if (a == aLen) {
						printf("received partial input message\n");
						break;
					}
					aV->handleInput(aBuf+aTot);
				}
			}
		}
	}

	WSACleanup();
	return true;
}

