function dropdown(ID, list, after){
	if (arguments.length < 3) {
		after = "#controls";
	}
    $(after).append('<select id="' + ID + '" title="' + list.Title + '" class="' + list.Class + '"></select>');
    for (var k = 0; k < list["Values"].length; k++) {
        VALUE = list["Values"][k]["Value"];
        TITLE = list["Values"][k]["Title"];
        if (k == 0) {
            $('#' + ID).append('<option value="' + VALUE + '" class="def">---' + list.Titleshort + '---</option>');
            $('#' + ID).append('<option value="' + VALUE + '" selected="">' + TITLE + '</option>');
        }
        else {
            $('#' + ID).append('<option value="' + VALUE + '"           ">' + TITLE + '</option>');
        }
    }
}
