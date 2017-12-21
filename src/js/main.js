/*******************************************************************************
 * Projektuppgift TouchTyping, Kurs: DT146G
 * File: main.js
 * Desc: main JavaScript file for Project
 *
 * Marcus Hammarberg Student
 * maha1611
 * maha1611@student.miun.se
 ******************************************************************************/
var gameComplete = new Audio('./audio/complete.mp3');
var errorSound = new Audio('./audio/error.mp3');
var correctSound = new Audio('./audio/correct.mp3');

let text1 = {};
text1.title = "Doktor Glas"
text1.author = "Hjalmar Söderberg";
text1.language = "swedish";
text1.text = "Jag stod vid pastor Gregorius bädd; han låg sjuk. Övre delen av hans kropp var blottad, och jag lyssnade på hans hjärta. Sängen stod i hans arbetsrum; en kammarorgel stod i ett hörn, och någon spelade på den. Ingen koral, knappt en melodi. Bara formlösa fugaartade tongångar fram och tillbaka. En dörr stod öppen; det oroade mig, men jag kunde inte komma mig för att få den stängd.";

let text2 = {};
text2.title = "Förändringens Tid";
text2.author = "Erik Strom";
text2.language = "swedish";
text2.text = "Vinden viner över sällsamma ruiner, över berg och slätter, dagar som nätter. Ger världen form inför den kommande storm, likt gudars sång, skall bli dess undergång. Svart som natten, blank likt vatten, i skyn du häver då Allfader kräver. Åter resas skall nu han, som i misteln döden fann. Sonas med sin ene broder, den blinde född av samma moder. Satt att råda är de båda, bröders hand över evigt land.";

let text3 = {};
text3.title = "Moln";
text3.author = "Karin Boye";
text3.language = "swedish";
text3.text = "Se de mäktiga moln, vilkas fjärran höga toppar stolta, skimrande resa sig, vita som vit snö! Lugna glida de fram för att slutligen lugnt dö sakta lösande sig i en skur av svala droppar. Majestätiska moln - genom livet, genom döden gå de leende fram i en strålande sols sken utan skymmande oro i eter så klart ren, gå med storstilat, stilla förakt för sina öden.";

let text4 = {};
text4.title = "Katherine";
text4.author = "Abraham Lincoln";
text4.language = "english";
text4.text = "I am not bound to win, but I am bound to be true. I am not bound to succeed, but I am bound to live by the light that I have. I must stand with anybody that stands right, and stand with him while he is right, and part with him when he goes wrong.";

let text5 = {};
text5.title = "Integrity";
text5.author = "Francis Bacon";
text5.language = "english";
text5.text = "It's not what we eat but what we digest that makes us strong; not what we gain but what we save that makes us rich; not what we read but what we remember that makes us learned; and not what we profess but what we practice that gives us integrity.";

let text6 = {};
text6.title = "hej";
text6.author = "lej";
text6.language = "swedish";
text6.text = "haj på daj, jag heter kaj.";

let texts = [text1, text2, text3, text4, text5, text6];

let stats; // Contains the statistics of the game
let timer;
let startTime;  // Game started at this time
let currentTextLength;  // The chosen texts length
let lastX = 0, lastY = 100;
let ctx;

// Initial page setup with eventlisteners etc.
function pageSetup()
{   //Event setup
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
// Adds the options to the select tag
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
//Eventlistener functions
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
                document.getElementById("theText").innerHTML = document.getElementById("theText").innerHTML + '<span id="' + i + '">'+ entry['text'].charAt(i) +"</span>";
                if(entry['text'].charAt(i) == " ") {words++;}
            }
            document.getElementById("textHeader").innerHTML = entry['title'];
            document.getElementById("textAuthor").innerHTML = entry['author'] + "(" + words + " words, " + currentTextLength + " chars)";
        }
    })
}

function handleStartStop(event)
{
    event = event || window.event;  // For older versions
    let targetElement = event.target || event.srcElement;

    if(targetElement.getAttribute("id") == "start") { startChallenge(); }
    else { stopChallenge(); }
}

function startChallenge()
{
    document.getElementById("start").setAttribute("id", "stop");
    stats = {};
    stats.grossWPM = 0;
    stats.netWPM = 0;
    stats.accuracy = 0;
    stats.errors = 0;
    stats.currentChar = 0;
    stats.totalCharsTyped = 0;

    clearGame();

    document.getElementById("input").removeAttribute("disabled");
    document.getElementById("input").addEventListener("keydown", updateStatsObject);
    document.getElementById("input").focus();
    document.getElementById(0).setAttribute("class", "currentChar");

    timer = window.setInterval(updateStats, 1000);
    startTime = new Date();

    ctx = document.getElementById("myCanvas").getContext("2d");
    ctx.beginPath();
}
function clearGame()
{
    for(let i = 0; i < currentTextLength; i++)
    {
        document.getElementById(i).removeAttribute("class");
    }
    document.getElementById("input").value  = "";
    document.getElementById("input").setAttribute("placeholder", "Type here...");
    let canvas = document.getElementById("myCanvas");
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    lastX = 0;
    lastY = 100;
}
function stopChallenge()
{
    updateStats();  // last update to make sure the correct stats are displayed
    document.getElementById("stop").setAttribute("id", "start");
    document.getElementById("input").setAttribute("disabled", true);
    ctx.closePath();
    clearInterval(timer);
}
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

    ctx.moveTo(lastX, lastY);
    ctx.lineTo(lastX += 4, 100 - stats.netWPM);
    ctx.strokeStyle="#FFFF00";
    ctx.stroke();
    
    
    document.getElementById("gross").innerHTML = stats.grossWPM;
    document.getElementById("net").innerHTML = stats.netWPM;  //More accurate than the one in the description
    document.getElementById("accuracy").innerHTML = stats.accuracy + "%";
    document.getElementById("errors").innerHTML = stats.errors;
}

function updateStatsObject(event)
{
    if(stats.currentChar + 1 < currentTextLength)
    {
        document.getElementById(stats.currentChar + 1).setAttribute("class", "currentChar");
    }
    if(stats.currentChar < currentTextLength)
    {
        let char = document.getElementById(stats.currentChar).innerHTML;
        let key = event.key;
        let checked = document.getElementById("casing").checked;

        if(key != "Shift")
        {
            if(char == key)
            { 
                document.getElementById(stats.currentChar).setAttribute("class", "correct");
                correctSound.pause();
                correctSound.currentTime = 0;
                correctSound.play();
            }
            else if(char.toUpperCase() == key.toUpperCase() && checked)
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
                errorSound.pause();
                errorSound.currentTime = 0;
                errorSound.play();
            }
            stats.totalCharsTyped++;
            stats.currentChar++;
            
            if(key == " ") { document.getElementById("input").value = ""; }
        }
    }
    if(stats.currentChar == currentTextLength)
    {
        // Game finished
        gameComplete.play();
        stopChallenge();
    }
}

window.addEventListener("load", pageSetup);