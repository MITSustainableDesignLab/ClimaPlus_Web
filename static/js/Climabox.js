function getInputValue(){
        // Selecting the input element and get its value
        var inputL = document.getElementById("cb_w").value*10;
        var inputW = document.getElementById("cb_h").value*10;
        var inputH = document.getElementById("cb_l").value*10;
        var ids = ["wnorth","wsouth","wwest","weast"]
        var mySel = document.getElementById(ids[0]);
        var mySel2 = document.getElementById(ids[1]);
        var mySel3 = document.getElementById(ids[2]);
        var mySel4 = document.getElementById(ids[3]);

        document.documentElement.style
        .setProperty('--wn', (1-mySel)*(minNS/2).toString()+"px");
        document.documentElement.style
        .setProperty('--ws', (1-mySel2)*(minNS/2).toString()+"px");
        document.documentElement.style
        .setProperty('--ww', (1-mySel3)*(minEW/2).toString()+"px");
        document.documentElement.style
        .setProperty('--we', (1-mySel4)*(minEW/2).toString()+"px");



        // Displaying the value
        document.documentElement.style
        .setProperty('--width', inputW.toString()+"px");
        document.documentElement.style
        .setProperty('--height', inputH.toString()+"px");
        document.documentElement.style
        .setProperty('--length', inputL.toString()+"px");
        document.documentElement.style
        .setProperty('--halfwidth', ((inputW/2).toString())+"px");
        document.documentElement.style
        .setProperty('--halfheight', ((inputH/2).toString())+"px");
        document.documentElement.style
        .setProperty('--halflength', ((inputL/2).toString())+"px");
        document.documentElement.style
        .setProperty('--hlratio', (((inputH/inputL)*(inputL/2)).toString())+"px");
        document.documentElement.style
        .setProperty('--hlratiowhole', ((inputL-(inputH/inputL)*(inputL/2)).toString())+"px");
        document.documentElement.style
        .setProperty('--wlratio', ((inputH*.5).toString())+"px");
        document.documentElement.style
        .setProperty('--wlratiowhole', (inputW - inputH*.5).toString()+"px");

       // document.getElementById("l").innerHTML = getComputedStyle(document.documentElement)
    //.getPropertyValue('--length')+" :length";
     //   document.getElementById("w").innerHTML = getComputedStyle(document.documentElement)
    //.getPropertyValue('--width')+ " :width";
    //    document.getElementById("h").innerHTML = getComputedStyle(document.documentElement)
    //.getPropertyValue('--height')+" :Height";
        }

var box = document.querySelector('.bigbox');
var radioGroup = document.querySelector('.radio-group');
var currentClass = '';

function changeSide() {
  var checkedRadio = radioGroup.querySelector(':checked');
  var showClass = 'show-' + checkedRadio.value;
  if ( currentClass ) {
    box.classList.remove( currentClass );
  }
  box.classList.add( showClass );
  currentClass = showClass;
}
// set initial side
changeSide();

radioGroup.addEventListener( 'change', changeSide );