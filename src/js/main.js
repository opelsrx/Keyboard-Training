/*******************************************************************************
 * Projektuppgift TouchTyping, Kurs: DT146G
 * File: main.js
 * Desc: main JavaScript file for Project
 *
 * Marcus Hammarberg Student
 * maha1611
 * maha1611@student.miun.se
 ******************************************************************************/

//================== Global variables ==================
let gameComplete = new Audio('./audio/complete.mp3');
let errorSound = new Audio('./audio/error.mp3');
let correctSound = new Audio('./audio/correct.mp3');
let xmlFile;
let texts = [];

let stats; // Contains the statistics of the game
let timer;  // Used for timing the game
let startTime;  // Game started at this time
let currentTextLength;  // The chosen texts length
let lastX = 0, lastY = 100; // Used by th canvas to draw from the correct place
let canvasContext;    // Canvas 2D context
let xhttp = new XMLHttpRequest();

//================== XMLHttpRequest to get the xml files containing the texts ==================
xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
       // Typical action to be performed when the document is ready:
        xmlFile = xhttp.responseXML;

        let length = xmlFile.getElementsByTagName("author").length;

        for(let i = 0; i < length; i++)
        {
            let tempObj = {};

            tempObj.title = xmlFile.getElementsByTagName("title")[i].innerHTML;
            tempObj.author = xmlFile.getElementsByTagName("author")[i].innerHTML;
            tempObj.language = xmlFile.getElementsByTagName("language")[i].innerHTML;
            tempObj.text = xmlFile.getElementsByTagName("text")[i].innerHTML;
            texts.push(tempObj);
        }
        pageSetup(); // When the xml is loaded successfully, set up the page. If the files doesn't load, the page wont work anyway.
    }
};
//================== Initiates the XMLHttpRequest ==================
function loadXML()
{
    //Loads the xml-files
    xhttp.open("GET", "xml/texts.xml", true);
    xhttp.responseType = "document";
    xhttp.send();
}
//================== Initial page setup with eventlisteners etc ==================
function pageSetup()
{
    //Event setup
    document.getElementById("textSelection").addEventListener("change", showText);
    document.getElementById("swe").addEventListener("change", addOptions);
    document.getElementById("eng").addEventListener("change", addOptions);

    //Load initial text choices
    addOptions();

    let startStopBtn = document.createElement("button");
    startStopBtn.setAttribute("id", "start");
    startStopBtn.addEventListener("click", handleStartStop);
    document.getElementById("inputField").appendChild(startStopBtn);
}
//================== Adds the options to the select tag ==================
function addOptions()
{
    document.getElementById("textSelection").innerHTML = ""; // Reset the options

    let languageOpt;
    if(document.getElementById('swe').checked) { languageOpt = 'swedish'; }
    else languageOpt = 'english';

    texts.forEach(function(entry)
    {
        if(entry.language == languageOpt)
        {
            let opt = document.createElement("option");
            
            opt.innerHTML = entry['title'];
            document.getElementById("textSelection").appendChild(opt);
        }
    });

    //Load text
    showText();
}
//=============== Eventlistener function that displays the correct text depending on the current chosen option ===============
function showText()
{
    let select = document.getElementById("textSelection");
    let option = select.options[select.selectedIndex].value;

    texts.forEach(function(entry)
    {
        if(entry['title'] == option)
        {
            document.getElementById("theText").innerHTML = "";

            currentTextLength = entry['text'].length;
            let words = 1;
            for(let i  = 0; i < currentTextLength; i++)
            {
                //Adds a <span> around every char with a unique id to be able to mark them when playing
                document.getElementById("theText").innerHTML = document.getElementById("theText").innerHTML + '<span id="' + i + '">'+ entry['text'].charAt(i) +"</span>";
                if(entry['text'].charAt(i) == " ") {words++;}   // the ammount of spaces plus 1 is the ammount of words.
            }
            document.getElementById("textHeader").innerHTML = entry['title'];
            document.getElementById("textAuthor").innerHTML = entry['author'] + "(" + words + " words, " + currentTextLength + " chars)";
        }
    })
}
//================== Evenlistener function that either stops or starts the game ==================
function handleStartStop(event)
{
    event = event || window.event;  // For older versions
    let targetElement = event.target || event.srcElement;

    if(targetElement.getAttribute("id") == "start") { startChallenge(); }
    else { stopChallenge(); }
}
//================== Resets the gamefield and starts the game ==================
function startChallenge()
{
    document.getElementById("start").setAttribute("id", "stop");
    //Reset all stats
    stats = {};
    stats.grossWPM = 0;
    stats.netWPM = 0;
    stats.accuracy = 0;
    stats.errors = 0;
    stats.currentChar = 0;
    stats.totalCharsTyped = 0;

    clearGame(); //Reset game area

    //New game setup
    document.getElementById("input").removeAttribute("disabled");
    document.getElementById("input").addEventListener("input", updateStatsObject);
    document.getElementById("input").focus();
    document.getElementById("input").removeAttribute("placeholder");
    document.getElementById(0).setAttribute("class", "currentChar");

    //Timersetup
    timer = window.setInterval(updateStats, 1000);
    startTime = new Date();

    //Canvas setup
    canvasContext = document.getElementById("myCanvas").getContext("2d");
    canvasContext.lineWidth=0.3;
    canvasContext.beginPath();
}
//================== Resets the gamefield ==================
function clearGame()
{
    document.getElementById("textSelection").setAttribute("disabled", true);
    document.getElementById("swe").setAttribute("disabled", true);
    document.getElementById("eng").setAttribute("disabled", true);
    // Removes the red, green text color and grey background
    for(let i = 0; i < currentTextLength; i++)
    {
        document.getElementById(i).removeAttribute("class");
    }
    document.getElementById("input").value  = "";
    let canvas = document.getElementById("myCanvas");
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    lastX = 0;
    lastY = 100;
}
//================== Stops the game when either the stop button is pressed or the game is finished ==================
function stopChallenge()
{
    updateStats();  // last update to make sure the correct stats are displayed
    document.getElementById("stop").setAttribute("id", "start");
    document.getElementById("input").value = "";
    document.getElementById("input").setAttribute("disabled", true);
    document.getElementById("input").setAttribute("placeholder", "Type here...");
    canvasContext.closePath();
    clearInterval(timer);
    document.getElementById("textSelection").removeAttribute("disabled");
    document.getElementById("swe").removeAttribute("disabled");
    document.getElementById("eng").removeAttribute("disabled");
}
//================== Updates the stats displayed on the screen ==================
function updateStats()
{
    let d = new Date();
    let elapsedSec = Math.abs(d.getTime() - startTime.getTime());

    elapsedSec = parseInt((elapsedSec / 1000), 10);
    let elapsedMin = elapsedSec/60;
    lastY = 100 - stats.netWPM;

    stats.grossWPM = parseInt((stats.totalCharsTyped / 5)/elapsedMin, 10);
    stats.netWPM = parseInt(((stats.totalCharsTyped - stats.errors) / 5)/elapsedMin, 10);
    stats.accuracy = parseInt((((stats.totalCharsTyped - stats.errors)/stats.totalCharsTyped) * 100), 10);

    canvasContext.moveTo(lastX, lastY);
    canvasContext.lineTo(lastX += 4, 100 - stats.netWPM);
    canvasContext.strokeStyle="#FFFF00";
    canvasContext.stroke();
    
    
    document.getElementById("gross").innerHTML = stats.grossWPM;
    document.getElementById("net").innerHTML = stats.netWPM;  //More accurate than the one in the description
    document.getElementById("accuracy").innerHTML = stats.accuracy + "%";
    document.getElementById("errors").innerHTML = stats.errors;
    document.getElementById("input").removeAttribute("class");
}
//================== Updates the stats-object that holds the stats of the game ==================
function updateStatsObject(event)
{
    if(stats.currentChar + 1 < currentTextLength)
    {
        document.getElementById(stats.currentChar + 1).setAttribute("class", "currentChar");
    }
    if(stats.currentChar < currentTextLength)
    {
        
        let charExpected = document.getElementById(stats.currentChar).innerHTML;
        let charPressed = event.data;
        let checked = document.getElementById("casing").checked;

        if(charPressed != "Shift")
        {
            if(charExpected == charPressed)
            { 
                document.getElementById(stats.currentChar).setAttribute("class", "correct");
                correctSound.pause();
                correctSound.currentTime = 0;
                correctSound.play();
            }
            else if(charExpected.toUpperCase() == charPressed.toUpperCase() && checked)
            {
                document.getElementById(stats.currentChar).setAttribute("class", "correct");
                correctSound.pause();
                correctSound.currentTime = 0;
                correctSound.play();
            }
            else
            {
                stats.errors++;
                document.getElementById(stats.currentChar).setAttribute("class", "wrong");
                document.getElementById("input").setAttribute("class", "wrongPress");
                errorSound.pause();
                errorSound.currentTime = 0;
                errorSound.play();
            }
            stats.totalCharsTyped++;
            stats.currentChar++;
            
            if(charPressed == " ") { document.getElementById("input").value = ""; }
        }
    }
    if(stats.currentChar == currentTextLength)
    {
        // Game finished
        gameComplete.play();
        stopChallenge();
    }
}
//== Eventlistener that runs the script when the html is fully loaded ==
window.addEventListener("load", loadXML);