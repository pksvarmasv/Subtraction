//=======================================================
// Copyright (C) 2022, 2024, JANBAV.
// Author : Sudhir Varma
//=======================================================

// Global variables. 
var tblBkGround = "black";
var tblForeGround = "white";
var tblRowLabelBkGround = "green";
var tblRowLabelForeGround = "white";
var tblHiliteBkGround = "red";
var tblHiliteForeGround = "white";
var tblTempBkGround = "blue";
var myArray= [[], [], [], []]; 
const rowLabels = ["Carry", "Number 1", "Number 2", "Result"];

// Since there is a state machine, easier to use global variables than passing parameters around.
var Step = 0;
var maxDigits = 0;
var numCols;
var num1 = "";
var num2 = "";

var currentCol=0;	// current column we are updating. Start with column 1	
var doneSolving = false;
var hideSteps = false;
var exerciseMode = false;
var lsdigit = true;

var tbl = document.getElementById("Tbl");

function OnPageLoad()
{
}

// Allow only number keys. Prevent keys from A..Z etc., 
function LimitKeys(event)
{
	if (((event.keyCode >= 65) && (event.keyCode <= 90)))  {	// Prevent a-z.
		event.stopPropagation();
		event.preventDefault();
	}

	if ((event.shiftKey) && ((event.keyCode >= 48) && (event.keyCode <= 57)))  {	// Prevent !, @, #, ....
		event.stopPropagation();
		event.preventDefault();
	}
	
	// Prevent other characters like Space, Enter, ....
	if ((event.code == "Enter") || 		(event.code == "Space") || (event.code == "Minus") || (event.code == "Equal") ||
		(event.code == "Semicolon") || (event.code == "Quote") || (event.code == "Comma") || (event.code == "Period") ||
		(event.code == "Slash") ||  (event.code == "BracketLeft") || (event.code == "BracketRight") ||
		(event.code == "Backslash") || (event.code == "Backquote"))	{	 
		event.stopPropagation();
		event.preventDefault(); 
	}
}


// Handle keystrokes pertaining to table
function tblKeyDown(event)
{
//	if (tbl.style.visibility == "visible") {
		if (!exerciseMode) { // if not in exercise mode
			if (event.ctrlKey && event.altKey && (event.keyCode == 84)) {	// Ctl-alt-T shortcut for "step-by-step"
				if (doneSolving) {
					alert("We are done solving. " + document.getElementById("Answer").innerHTML);	// Notify the user
					document.getElementById("Answer").focus();
				} else {
					nextStep();	// ctrl-alt-t takes you to "next step"
					}
				}
			} else {	// In Exercise mode
				LimitKeys(event);	// allow only number keys

				if (event.ctrlKey && event.altKey && (event.keyCode == 86)) {	// Ctl-alt-V shortcut for "Verify"
					verify();
				}	
			}
//	}
}

// Maximum digits (max of number 1 and number 2)
function getMaxDigits() {
  maxDigits = num1.length;
  if (maxDigits < num2.length) {
	  maxDigits = num2.length;
  }
}

function showSteps() {
  document.getElementById("StepsHeading").style.backgroundColor = "#FFEA00";
  document.getElementById("StepsHeading").style.visibility = "visible";
  document.getElementById("Steps").style.visibility = "visible";
  updateSteps();
}

function createTbl(numCols) {
  tbl.style.visibility = "visible";
	  
  // Create columns based on the number of digits	
  for (let i=0; i < 4; i++) {
	tbl.getElementsByTagName("tr")[i].cells[1].innerHTML = "";

	if (exerciseMode)
		tbl.getElementsByTagName("tr")[i].cells[1].setAttribute("contenteditable","true");
	else		
		tbl.getElementsByTagName("tr")[i].cells[1].setAttribute("contenteditable","false");
	
	for (let j=0; j < numCols-1; j++) {
		let cell = tbl.getElementsByTagName("tr")[i].insertCell(1);
		cell.innerHTML = "";
		if (exerciseMode)
			cell.setAttribute("contenteditable","true");
		else		
			cell.setAttribute("contenteditable","false"); // true
	}
  }

  // Highlight the first column. First column of each row has row label
  for (let i=0; i < 4; i++){	
	row = tbl.getElementsByTagName("tr")[i];
	cell = row.cells[0];
	cell.style.backgroundColor = tblRowLabelBkGround;
	cell.style.color = tblRowLabelForeGround;
  }
}

function initRow(r, num)
{
  let row = tbl.getElementsByTagName("tr")[r];

  for (let i=0; i < num.length; i++) {
	let cell = row.cells[maxDigits-i];
  
	// Highlight the just modified cells
	cell.style.backgroundColor = tblHiliteBkGround;
	cell.style.color = tblHiliteForeGround;
	cell.innerHTML= num[num.length-1-i];
  }
}

function showAnswer()
{
	document.getElementById("AnswerHeading").style.visibility = "visible";
	document.getElementById("AnswerHeading").style.backgroundColor = "#FFEA00";
	solution = "Answer is : ";

	for (let i=1; i <= maxDigits; i++)
		solution += tbl.getElementsByTagName("tr")[3].cells[i].innerHTML;
	
	let answer = document.getElementById("Answer");
	answer.style.visibility = "visible";
	answer. style.fontWeight = 'bold';
	answer.innerHTML = solution;
}

function removeHighlight() 
{
  let tbl = document.getElementById("Tbl");	

  for (let i=0; i < 4; i++){	
	row = tbl.getElementsByTagName("tr")[i];
	
	for (let j=1; j <= maxDigits; j++) {
  	  cell = row.cells[j];
	  cell.style.backgroundColor = tblBkGround;
	  cell.style.color = tblForeGround;
	}
  }
}

function updateSteps()
{
	let text = "";
    let steps = document.getElementById("Steps");
	
	switch (Step) {
	  case 0:
	    text = "- The table has 4 lines.\n"; 
		text = text + "- Line 1 is for storing 'borrow' (if any)."; 
		text = text + " Line 2 is for storing the first number.";
	    text = text + " Line 3 is for storing the second number. ";
		text = text + "Line 4 is for storing the result.<br>";
		text += "- Copy number 1 (" + num1 + ") over to line 2. Copy number 2 (" + num2 + ") over to line 3. Lowest digit should be in the right most column. Start subtracting the digits of Number 1 and Number 2, beginning with right most and store the result in line 4. If the digit of Number 2 is greater than Number 1, then borrow from previous digit and add it to Number 1.<br>";
		steps.innerHTML = "<b>" + text + "</b>";
		break;
		
	  case 1:
		if (myArray[0][currentCol] >= 0) {
		  text += "- Since " + myArray[2][currentCol] +  " is greater than " + myArray[1][currentCol] + " we need to borrow. With this we will be subtracting " +  myArray[2][currentCol] + " from  " + (myArray[1][currentCol]+10) + ". Since we borrowed, the previous digit becomes " + myArray[1][currentCol-1] + ".<br>"; 
		  steps.innerHTML += "<b>" + text + "</b>";
		}
		break;
		
	  case 2:	
	  case 3:	
		let str = toString(myArray[1][currentCol]);
		if (myArray[0][currentCol] > 0) {
			str = toString(myArray[1][currentCol] + 10);
		}	
		text += "- Subtract " + myArray[2][currentCol] + " from " +  str + ". Proceed to the next digits to the left.<br>"; 
		steps.innerHTML += "<b>" + text + "</b>";
		break;
	}
}

// Compute the solution
function compute()
{
	// Initialize the array first before starting computation
	for (let i = 0; i < 4; i++) {
		for (let j=0; j <= maxDigits; j++) {
			myArray[i].push(-1);
		}
	}
	for (let i=0; i < num1.length; i++) {
		myArray[1][maxDigits-i]= Number(num1[num1.length-1-i]);
	}

	for (let i=0; i < num2.length; i++) {
		myArray[2][maxDigits-i]= Number(num2[num2.length-1-i]);
	}

	// Now start computing

	for (let col= maxDigits; col > 0; col--) { 
		let val = myArray[1][col];
		// Process only valid locations. There is a chance that Number 2 has fewer digits. We know Number 1 has to be >= Number 2. 
		// So need to check only Number 2
		if (myArray[2][col] >= 0) {	
		  if (myArray[2][col] > myArray[1][col]) {	// if current digit of numerator greater than denominator
			myArray[0][col] = 1; // Borrow ..
			myArray[1][col-1] -= 1; // from previous digit
			val = 10 + myArray[1][col];
		  }
		  myArray[3][col] = val - myArray[2][col];
	  }	else
		  myArray[3][col] = myArray[1][col];
	}
}

function UpdateCell(Row, Cell, Str, BkColor, FgColor) {
  tbl.getElementsByTagName("tr")[Row].cells[Cell].style.backgroundColor = BkColor;
  tbl.getElementsByTagName("tr")[Row].cells[Cell].style.color = FgColor;
  tbl.getElementsByTagName("tr")[Row].cells[Cell].innerHTML = Str;
}


function nextStep() {
  var idx;
  
  switch (Step) {
    case 0:
	  if (!validateInput())
	    return false;
	
	  compute();	// Do the calculation
	  
	  // Start displaying the results
      numCols = maxDigits;  
	  createTbl(numCols);
	  initRow(1, num1);
	  initRow(2, num2);
	  showSteps();
      document.getElementById("btnSolve").disabled = true;
      document.getElementById("btnExercise").disabled = true;
      document.getElementById("btnVerify").disabled = true;
	  document.getElementById("btnNextStep").disabled = true;
	  setTblCursor(1, 2);	// set cursor
	  tbl.focus(); 
	break;
		
    case 1:
  	  removeHighlight();
	  
	  // Check if we borrowed. If we did the values in the array would be different from the table
  	  if (myArray[0][currentCol] >= 0) {
 	    updateSteps();
		UpdateCell(0,currentCol, myArray[0][currentCol], tblHiliteBkGround, tblHiliteForeGround);
		UpdateCell(1,currentCol-1, myArray[1][currentCol-1], tblHiliteBkGround, tblHiliteForeGround);
		break;
	  }
	  
	case 2:
	case 3:
  	  removeHighlight();
	  updateSteps();
		
	  // Fill the cells, while higllighting the ones involved in computation for this step 
	  for (let i=0; i < 3; i++) {
	    if (myArray[i][currentCol] >= 0)
		  UpdateCell(i,currentCol, myArray[i][currentCol], tblTempBkGround, tblHiliteForeGround); 
	  }

	  UpdateCell(3,currentCol, myArray[3][currentCol], tblHiliteBkGround, tblHiliteForeGround);	// Update the result 
	  setTblCursor(3, currentCol);	// set cursor
	  tbl.focus();
	  currentCol = currentCol - 1;
		
	  if (currentCol == 0)		// We are done calculating
  	    Step = 3;
	  else 
	    Step = 0;	// Kind of like looping thru the steps
		
      break;	

	case 4:
  	  removeHighlight();
			
	  document.getElementById("btnNextStep").disabled = true;
	  doneSolving = true;

    // We are done calculating
	  for (let i=1; i <= maxDigits; i++) {
  	    tbl.getElementsByTagName("tr")[3].cells[i].style.backgroundColor = tblHiliteBkGround;
	    tbl.getElementsByTagName("tr")[3].cells[i].style.color = tblHiliteForeGround;
	  }

	  showAnswer();
	  let text = "\n<b>We have now processed all columns and the problem is solved. ";
	  text += document.getElementById("Answer").innerHTML + "</b>";
	  document.getElementById("Steps").innerHTML += text;
	  alert("We are done solving. " + document.getElementById("Answer").innerHTML);	// Notify the user
	  tbl.focus();
	  break;
	}
  return true;
}


function setTblCursor(x, y) 
{
  let s = window.getSelection();
  let r = document.createRange();
  r.selectNodeContents(tbl.getElementsByTagName("tr")[x].cells[y]);
  s.removeAllRanges();
  s.addRange(r); 
 }

function getCursor() 
{
  // Now get the current cursor postion (row, column) and save it for future use when we get back focus
}

function exercise()
{
  if (!validateInput()) {
	return;
  }

  exerciseMode = true;	// We are in Exercise mode
  document.getElementById("btnExercise").disabled = true;
  document.getElementById("btnVerify").disabled = false;
  document.getElementById("btnSolve").disabled = true;
  document.getElementById("btnNextStep").disabled = true;
  
  let numCols = maxDigits;

  createTbl(numCols);
  tbl.focus();	// set focus to our table
  setTblCursor(0, 1);	// set cursor 	
}

function compareAnswers()
{
	let tbl = document.getElementById("Tbl");	
	
    for (let i=1; i <= maxDigits; i++) {
		if (myArray[3][i] != tbl.getElementsByTagName("tr")[3].cells[i].innerHTML)
			return false;
	}
	
	return true;
}

function verify()
{
  hideSteps=true;
  compute();	// Do the calculation

// ask them to retry. Ask them to press F5 and restart. Later add a separate button to retry so they need not enter the numbers again.
	
  document.getElementById("AnswerHeading").style.visibility = "visible";
  document.getElementById("AnswerHeading").style.backgroundColor = "#FFEA00";
  let answer = document.getElementById("Answer");
  answer.style.visibility = "visible";
  answer.style.color = tblHiliteForeGround;
  
  if (compareAnswers()) {
    answer.style.backgroundColor = "green";
	answer.innerHTML = "Answer is correct. Congratulations";
  }
  else {
    answer.style.backgroundColor = tblHiliteBkGround;
	answer.innerHTML = "Sorry, answer is incorrect.";  
  }
  alert(answer.innerHTML);	// Notify the user
  answer.focus();
  document.getElementById("btnVerify").disabled = false;

}

function validateInput() {
  num1 = document.getElementById("number1").value;
  num2 = document.getElementById("number2").value;

  if (num1 == ""){
    alert("Number 1 cannot be blank");
	return false;
  }
  
   if (isNaN(num1)) {
    alert("Invalid input. Number 1 must contain only digits");
	return false;
  }
	   
  
  if (num2 == ""){
	alert("Number 2 cannot be blank");
	return false;
  }

   if (isNaN(num2)) {
    alert("Invalid input. Number 2 must contain only digits");
	return false;
  }

  if (Number(num2) > Number(num1)) {
    alert("Number 1 must be larger than Number 2");
	return false;
  }
  
  getMaxDigits();
  currentCol = maxDigits; // We are going to start with the last column for computing the sum
  
  return true;
}


function solve() {
  while (!doneSolving) {
	if (!nextStep())
	  break;
  
	Step = Step + 1;
  }
}

function stepByStep() {
//    document.getElementById("btnNextStep").innerHTML = "NextStep"; // Hold off on this for now until I get more feedback
  if (!doneSolving) {
	if (nextStep()) 
	  Step = Step + 1;
  
	document.getElementById("btnNextStep").disabled = false;

  }
}
