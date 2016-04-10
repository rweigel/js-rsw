array=( onair.cc aramzs awstester aram aramzuckerscharff science neuroscience intranet kurzweilai air6 briandoyle drcary entrepreneurship giorgioascoli larrykerschberg masonbigdata benkerschberg crowdsourcing scicast bigdata donnahemmert neuroleadership danamoore mjvilardi virtualworlds augmentedreality scottjoy petermichel johncasey cis mec seguin masonsbdc kirkborne venturementors mecpw cfostrategy casey sandell paraskaul brainwavewellness neurofeedback sports robbie golf georgiagolf robbieufford spaceweather images spaceweatheranalytics spaceweatherlab computingforscientists weigel stickley isest2014 enlil summers meier poland curtis veibell hess jenweigelod yigit sigmaxi toddgillette gmuneuroscience insomnia socialmediaandpsychology neuroengineering neuromorphicengineering datavisualization kns neuroinformatics neuromorphology krasnow cn3 masonresearch )

for i in "${array[@]}"
do
	:
	site="http://$i.onair.cc/?oaapi=get&the=network"
	echo "Fetching $site"
	curl "$site" > json/$i.onair.cc.network.json
	if grep -q "redirect_to" "json/$i.onair.cc.network.json"; then
		echo "Removing json/$i.onair.cc.network.json"
		rm json/$i.onair.cc.network.json
	fi
done
