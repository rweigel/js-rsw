
x=rand(100,1);
y=rand(100,1);

figno = splot(x,y,P);

P = sget("Data");

P.Color(1) = 255;
P.Color(2) = 0;
P.Color(3) = 0;

sset(figno,P)
