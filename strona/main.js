const indexedDB = 
  window.indexedDB ||
  window.mozIndexedDB ||
  window.webkitIndexedDB ||
  window.msIndexedDB ||
  window.shimIndexedDB;
const databaseName = "myDB";
class Subject{
    constructor(id,name, term){
        this.id = id;
        this.name = name;
        this.term = term;
    }
    tohtmlTableRow(rowNumber){
        let row = `<tr><th scope="row">${rowNumber}</th><td>${this.name}</td><td>${this.term}</td></tr>`;
        return row;
    }
    tohtmlTableRowCancel(rowNumber){
        let row = `<tr><th scope="row">${rowNumber}</th><td>${this.name}</td><td>${this.term}</td><td><button id="${"subject"+this.id}">Usuń</button></td></tr>`;
        return row;
    }
    static htmlTableHeaders(){
        let headers = `<tr><th scope="col">#</th><th scope="col">Nazwa przedmiotu</th><th scope="col">Semestr, na którym obowiązuje</th></tr>`;
        return headers;
    }
    static htmlTableHeadersCancel(){
        let headers = `<tr><th scope="col">#</th><th scope="col">Nazwa przedmiotu</th><th scope="col">Semestr, na którym obowiązuje</th><th> </th></tr>`;
        return headers;
    }
}
class Grade{
    constructor(id, studentId, subjectId, value, date){
        this.id = id;
        this.studentId = studentId;
        this.subjectId = subjectId;
        this.value = value;
        this.date = date;
    }
    tohtmlTableRow(rowNumber,subjectName){
        let row = `<tr><th scope="row">${rowNumber}</th><td>${this.value}</td><td>${subjectName}</td><td>${new Date(this.date).toLocaleDateString('pl-PL')}</td><td><button id="${"grade"+this.id}">Usuń</button></td></tr>`;
        return row;
    }
    static htmlTableHeaders(){
        let headers = '<tr><th scope="col">#</th><th>Ocena</th><th>Nazwa przedmiotu</th><th>Data wystawienia</th><th> </th></tr>';
        return headers;
    }
}

class Student{
    constructor(id, name, actualTerm, subjects) {
        this.id = id;
        this.name = name;
        this.actualTerm = actualTerm;
        this.subjects = subjects;
    }
    tohtmlTableRow(rowNumber){
        return `<tr id="${"student"+this.id.toString()}"><th scope="row">${rowNumber}</th><td>${this.name}</td><td>${this.actualTerm}</td></tr>`;
    }
    static htmlTableHeaders(){
        let headers = '<tr><th scope="col">#</th><th>Imię i Nazwisko</th><th>Semestr</th></tr>';
        return headers;
    }
    toString(){
        return `id: ${this.id} name: ${this.name} actualTerm: ${this.actualTerm}`;
    }
}
function ArrayRemoveElement(array, value){
    let newArray = array.filter( x =>{
        return (x != value);
    });
    return newArray;
}
function showStudents(studentsDB){
    let container = document.getElementById("tableContainer");
    if(studentsDB.length > 0){
        let students = studentsDB.map( obj =>{
            return new Student(obj.id, obj.name, obj.actualTerm, obj.subjects);
        })
        container.innerHTML ="<h3>Baza Studentów:</h3><hr>";
        let table = `<table class="table">${Student.htmlTableHeaders()}`;
        let rowNumber = 1;
        students.forEach( student => {
            table+= student.tohtmlTableRow(rowNumber);
            rowNumber = rowNumber + 1;
        });
        table += "</table>"
        container.innerHTML += table;
        try{
        students.forEach( student => {
            document.getElementById("student"+student.id.toString()).addEventListener(`click`, function(){
                showStudentGrades(student);
                showStudentPage(student);
            });
        })
        } catch(err){
            console.error("Error while adding Event listeners to table rows", err);
        }

    } else {
        container.innerHTML = "<h3>Baza studentów jest aktualnie pusta</h3>";
    }
    
}
function showStudentPage(student){
    //podmiana przycisków na sklonowane w celu usunięcia eventListenerów i dodanie nowych event listenerów
    //--grades buttons-----------------------
        //show Grades
        const gradesButton = document.getElementById("studentPageShowGradesButton");
        const newGradesButton = gradesButton.cloneNode(true);
        gradesButton.parentNode.replaceChild(newGradesButton, gradesButton);
        newGradesButton.addEventListener("click", function(){showStudentGrades(student);});
        //add grades
        const addGradesButton = document.getElementById("studentPageAddGradeButton");
        const newAddGradesButton = addGradesButton.cloneNode(true);
        addGradesButton.parentNode.replaceChild(newAddGradesButton, addGradesButton);
        newAddGradesButton.addEventListener("click",function(){showAddGradeToStudentPage(student)});
        //submit new grade
        const submitAddGradeToStudent = document.getElementById("submitAddGradeToStudent");
        const newSubmitAddGradeToStudent = submitAddGradeToStudent.cloneNode(true);
        submitAddGradeToStudent.parentNode.replaceChild(newSubmitAddGradeToStudent, submitAddGradeToStudent);
        newSubmitAddGradeToStudent.addEventListener("click",function(){addGradeToStudent(student)});
        //cancel new grade 
        const cancelAddGradeToStudentButton = document.getElementById("cancelAddGradeToStudent");
        const newCancelAddGradeToStudentButton = cancelAddGradeToStudentButton.cloneNode(true);
        cancelAddGradeToStudentButton.parentNode.replaceChild(newCancelAddGradeToStudentButton, cancelAddGradeToStudentButton);
        newCancelAddGradeToStudentButton.addEventListener("click",function(){cancelAddGradeToStudent(student)});
    //--endGrades buttons--------------------
    //--subject buttons----------------------
        //show Subjects
        const subjectsButton = document.getElementById("studentPageShowSubjectsButton");
        const newSubjectsButton = subjectsButton.cloneNode(true);
        subjectsButton.parentNode.replaceChild(newSubjectsButton, subjectsButton);
        newSubjectsButton.addEventListener("click", function(){showStudentSubjects(student)});
        //add subjects
        const addSubjectsButton = document.getElementById("studentPageAddSubjectButton");
        const newAddSubjectsButton = addSubjectsButton.cloneNode(true);
        addSubjectsButton.parentNode.replaceChild(newAddSubjectsButton, addSubjectsButton);
        //event dodany w ShowStudentSubjects ze względu na dostęp do wszystkich obecnych w bazie danych przedmiotów
        //submit new subject
        const submitAddSubjectsButton = document.getElementById("submitAddSubjectToStudentButton");
        const newSubmitAddSubjectsButton = submitAddSubjectsButton.cloneNode(true);
        submitAddSubjectsButton.parentNode.replaceChild(newSubmitAddSubjectsButton, submitAddSubjectsButton);
        newSubmitAddSubjectsButton.addEventListener("click", function(){addSubjectToStudent(student)});
        //cancel new subject 
        const cancelAddSubjectsButton = document.getElementById("cancelAddSubjectToStudentButton");
        const newCancelAddSubjectsButton = cancelAddSubjectsButton.cloneNode(true);
        cancelAddSubjectsButton.parentNode.replaceChild(newCancelAddSubjectsButton, cancelAddSubjectsButton);
        newCancelAddSubjectsButton.addEventListener("click", function(){cancelAddSubjectToStudent(student)});
    //--end subjects buttons------------------
    //--deleteStudentButton
        const deleteStudentButton = document.getElementById("deleteStudentButton");
        const newdeleteStudentButton = deleteStudentButton.cloneNode(true);
        deleteStudentButton.parentNode.replaceChild(newdeleteStudentButton, deleteStudentButton);
        newdeleteStudentButton.addEventListener("click", function(){deleteStudent(student)});
    //---------------
    //wyświetlenie danych studenta
    document.getElementById("studentPageName").innerHTML=`${student.name}`;
    document.getElementById("studentPageActualTerm").innerHTML = `${student.actualTerm}`;
    //-------setting visible elements
    document.getElementById("refreshButton").style.display = "none";
    document.getElementById("addStudentForm").style.display = "none";
    document.getElementById("tableContainer").style.display = "none";
    document.getElementById("studentPage").style.display = "block";
    document.getElementById("addSubjectForm").style.display = "none";
    document.getElementById("studentPageGrades").style.display = "none";
    document.getElementById("studentPageSubjects").style.display = "none";
    document.getElementById("addSubjectToStudentPage").style.display = "none";
    document.getElementById("addGradeToStudentPage").style.display = "none";
    //-----------------------
}
function startConnection(){
    //-------setting visible elements
    document.getElementById("refreshButton").style.display = "flow-root";
    document.getElementById("addStudentForm").style.display = "none";
    document.getElementById("tableContainer").style.display = "block";
    document.getElementById("studentPage").style.display = "none";
    document.getElementById("addSubjectForm").style.display = "none";
    document.getElementById("addSubjectToStudentPage").style.display = "none";
    document.getElementById("addGradeToStudentPage").style.display = "none";
    document.getElementById("allSubjectsPage").style.display = "none";
    //-----------------------
    //promise to retrive data from students objectStore
    let myPromise = new Promise(function(myResolve, myReject){
        const request = indexedDB.open(databaseName, 1);
        request.onupgradeneeded = function(event) {
            let db = event.target.result;
            let studentsObjectStore = db.createObjectStore("Students", {keyPath: "id"});
            studentsObjectStore.createIndex("idIndex", "id", { unique: true });
            let subjectsObjectStore = db.createObjectStore("Subjects", {keyPath: "id"});
            subjectsObjectStore.createIndex("idIndex", "id", { unique: true });
            let gradesObjectStore = db.createObjectStore("Grades", {keyPath: "id"});
            gradesObjectStore.createIndex("idIndex", "id", {unique: true});
            gradesObjectStore.createIndex("studentIdIndex", ["studentId"], { unique: false});
            gradesObjectStore.createIndex("subjectIdIndex", ["subjectId"], { unique: false});
            
            console.log("Established connection with empty database. Created ObjectStores.");
        }
        request.onsuccess = function(event) {
            let db = event.target.result;
            console.log("Connection with database has been established.")
            let transaction = db.transaction("Students", "readonly");
            let objectStore = transaction.objectStore("Students");
            let readRequest = objectStore.getAll();
            readRequest.onsuccess = function(event) {
                let result = event.target.result;
                myResolve(result);
            }
            readRequest.onerror = function(event) {
                myReject(event);
            }
            transaction.oncomplete = function(){
                db.close();
                console.log("Transaction has been completed.");
            }
            transaction.onerror = function(event){
                console.error("Transaction has been canceled.", event);
            }
        }
        request.onerror = function(event) {
            console.error("Couldn't establish connection with database. ", event);
        }
    });

    //using values from promise
    myPromise.then(
        function(value){
            //showing table of students
            showStudents(value);
        },
        function(error){
            console.error("Reading students error:",error);
        }
    );
}
function showAddStudentForm(){
    //-------setting visible elements
    document.getElementById("refreshButton").style.display = "none";
    document.getElementById("addStudentForm").style.display = "block";
    document.getElementById("tableContainer").style.display = "none";
    document.getElementById("studentPage").style.display = "none";
    document.getElementById("addSubjectForm").style.display = "none";
    document.getElementById("addSubjectToStudentPage").style.display = "none";
    document.getElementById("addGradeToStudentPage").style.display = "none";
    document.getElementById("allSubjectsPage").style.display = "none";
    //-----------------------
}
function addStudent(){

    let name = document.getElementById("StudentName").value;
    document.getElementById("StudentName").value = "";
    let actualTerm = parseInt(document.getElementById("StudentActualTerm").value);
    document.getElementById("StudentActualTerm").value = "";
    if(name && actualTerm){
        const request = indexedDB.open(databaseName,1);
        request.onsuccess = function(event) {
            let db = event.target.result;
            let transaction = db.transaction(["Students"], "readwrite");
            let objectStore = transaction.objectStore("Students");

            let myPromise = new Promise(function(myResolve, myReject){
                let index = objectStore.index("idIndex");
                let openCursorRequest = index.openCursor(null, 'prev');
                openCursorRequest.onsuccess = function(event){
                    result = event.target.result;
                    myResolve(result ? result.value.id : null);
                }
                openCursorRequest.onerror = function(event){
                    myReject(event);
                }
            });
            myPromise.then(
                function(value){
                    let student;
                    if(value !== null){
                        student = new Student(parseInt(value)+1,name, actualTerm, []);
                    } else {
                        student = new Student(0, name, actualTerm, []);
                    }
                    let addRequest = objectStore.add(student);
                    
                    addRequest.onsuccess = function(){
                        console.log("Successfully added student to Students:", student);
                    }
                    addRequest.onerror = function(event){
                        console.error("Error while adding student to Students:",event);
                    }
                },
                function(error){
                    console.error("Error reading last id:",error);
                }
            );
            transaction.oncomplete = function(){
                db.close();
                console.log("Transaction has been completed.");
                startConnection(); //refresh view of students
            }
            transaction.onerror = function(error){
                console.error("Transaction has been canceled.", event);
            }

        }
    } else{
        console.error("You should provide name and actualTerm of student")
    }
    
}
function cancelAddStudent(){
    document.getElementById("StudentName").value = "";
    document.getElementById("StudentActualTerm").value = "";
    //-------setting visible elements
    document.getElementById("refreshButton").style.display = "flow-root";
    document.getElementById("addStudentForm").style.display = "none";
    document.getElementById("tableContainer").style.display = "block";
    document.getElementById("studentPage").style.display = "none";
    document.getElementById("addSubjectForm").style.display = "none";
    //-----------------------
}
function showAddSubjectForm(){
    //-------setting visible elements
    document.getElementById("refreshButton").style.display = "none";
    document.getElementById("addStudentForm").style.display = "none";
    document.getElementById("tableContainer").style.display = "none";
    document.getElementById("studentPage").style.display = "none";
    document.getElementById("addSubjectForm").style.display = "block";
    document.getElementById("addSubjectToStudentPage").style.display = "none";
    document.getElementById("addGradeToStudentPage").style.display = "none";
    document.getElementById("allSubjectsPage").style.display = "none";
    //-----------------------
}
function cancelAddSubject(){
    document.getElementById("SubjectName").value = "";
    document.getElementById("SubjectTerm").value = "";
    //-------setting visible elements
    document.getElementById("refreshButton").style.display = "flow-root";
    document.getElementById("addStudentForm").style.display = "none";
    document.getElementById("tableContainer").style.display = "block";
    document.getElementById("studentPage").style.display = "none";
    document.getElementById("addSubjectForm").style.display = "none";
    //-----------------------
}
function addSubject(){
    let name = document.getElementById("SubjectName").value;
    document.getElementById("SubjectName").value = "";
    let term = document.getElementById("SubjectTerm").value;
    document.getElementById("SubjectTerm").value = "";
    if(name && term){
        const request = indexedDB.open(databaseName,1);
        request.onsuccess = function(event){
            let db = event.target.result;
            let transaction = db.transaction(["Subjects"], "readwrite");
            let objectStore = transaction.objectStore("Subjects");

            let myPromise = new Promise(function(myResolve, myReject){
                let index = objectStore.index("idIndex");
                let openCursorRequest = index.openCursor(null, 'prev');
                openCursorRequest.onsuccess = function(event){
                    result = event.target.result;
                    myResolve(result ? result.value.id : null);
                }
                openCursorRequest.onerror = function(event){
                    myReject(event);
                }
            });
            myPromise.then(
                function(value){
                    let subject;
                    if(value !== null){
                        subject = new Subject(parseInt(value)+1,name,term);
                    } else {
                        subject = new Subject(0,name,term);
                    }
                    let addRequest = objectStore.add(subject);
                    
                    addRequest.onsuccess = function(){
                        console.log("Successfully added subject to Subjects:", subject);
                    }
                    addRequest.onerror = function(event){
                        console.error("Error while adding subject to Subjects:",event);
                    }
                },
                function(error){
                    console.error("Error reading last id:",error);
                }
            );
            transaction.oncomplete = function(){
                db.close();
                console.log("Transaction has been completed.");
            }
            transaction.onerror = function(error){
                console.error("Transaction has been canceled.", event);
            }

        }
        
    } else{
        console.error("You should provide name and actualTerm of student")
    }
    //-------setting visible elements
    document.getElementById("refreshButton").style.display = "flow-root";
    document.getElementById("addStudentForm").style.display = "none";
    document.getElementById("tableContainer").style.display = "block";
    document.getElementById("studentPage").style.display = "none";
    document.getElementById("addSubjectForm").style.display = "none";
    //-----------------------
}
function showStudentSubjects(student){
    document.getElementById("studentPageShowGradesButton").style.backgroundColor = 'rgb(234,234,234)';
    document.getElementById("studentPageShowSubjectsButton").style.backgroundColor = 'rgb(180,180,180)';
    //-------setting visible elements
    document.getElementById("studentPageGrades").style.display = "none";
    document.getElementById("studentPageSubjects").style.display = "block";
    document.getElementById("addSubjectToStudentPage").style.display = "none";
    document.getElementById("addGradeToStudentPage").style.display = "none";
    //--------------------------------
    let myPromise = new Promise(function(myResolve, myReject){
        const request = indexedDB.open(databaseName,1);
        request.onsuccess = function(event){
            let db = event.target.result;
            let transaction = db.transaction(["Subjects"], "readonly");
            let objectStore = transaction.objectStore("Subjects");
            let getRequest = objectStore.getAll();
            getRequest.onsuccess = function(event){
                let result = event.target.result;
                myResolve(result);
            }
            getRequest.onerror = function(event){
                myReject(event);
            }
            transaction.oncomplete = function(){
                db.close();
                console.log("Transaction has been completed.");
            }
            transaction.onerror = function(event){
                console.error("Transaction has been canceled.", event);
            }
        }

    });
    myPromise.then(
        function(allSubjects){
            let subjectsObj = allSubjects.filter( subject => {
                let result = false;
                student.subjects.forEach(function(subjectId){
                    if(subjectId == subject.id){
                        result = true;
                    }
                });
                return result;
            });
            let notStudentSubjectsDB = allSubjects.filter( subject => !subjectsObj.includes(subject));
            let notStudentSubjects = notStudentSubjectsDB.map( obj => {
                return new Subject(obj.id, obj.name, obj.term);
            });
            //dodanie eventlistenera do dodania nowego przedmiotu
            document.getElementById("studentPageAddSubjectButton").addEventListener("click", function(){showAddSubjectToStudentPage(notStudentSubjects)});
            if(student.subjects.length > 0){
                
                let subjects = subjectsObj.map( subject => {
                    return new Subject(subject.id, subject.name, subject.term);
                });
                let table = `<h4>Student uczęszcza / uczęszczał na ponizsze przedmioty:</h4><table class="table">${Subject.htmlTableHeaders()}`;
                let rowNumber = 1;
                subjects.forEach( subject => {
                    table += subject.tohtmlTableRow(rowNumber);
                    rowNumber = rowNumber + 1;
                });
                table += "</table>";
                document.getElementById("studentPageSubjectsTable").innerHTML = table;
            }else{
                
                document.getElementById("studentPageSubjectsTable").innerHTML = "<h4>Student nie uczęszcza / uczęszczał na zaden przedmiot.</h4>";
            }
            
        },
        function(error){
            console.error("Error while reading Subjects:",error);
        }
    );
    
}
function showStudentGrades(student){
    document.getElementById("studentPageShowGradesButton").style.backgroundColor = 'rgb(180,180,180)';
    document.getElementById("studentPageShowSubjectsButton").style.backgroundColor = 'rgb(234,234,234)';
    //-------setting visible elements
    document.getElementById("studentPageGrades").style.display = "block";
    document.getElementById("studentPageSubjects").style.display = "none";
    document.getElementById("addSubjectToStudentPage").style.display = "none";
    document.getElementById("addGradeToStudentPage").style.display = "none";
    //--------------------------------
    const request = indexedDB.open(databaseName,1);
    request.onsuccess = function(event) {
        let db = event.target.result;
        let transaction = db.transaction(["Grades"],"readonly");
        let objectStore = transaction.objectStore("Grades");
        let studentIdIndex = objectStore.index("studentIdIndex");
        // get all grades that their studentid field is equal to studentId 
        let getRequest = studentIdIndex.getAll([student.id]);

        getRequest.onsuccess = function(event){
            let result = event.target.result;
            if(result.length > 0) {
                let grades = result.map( grade => {
                    return new Grade(grade.id, grade.studentId, grade.subjectId, grade.value, grade.date);
                });
                let transaction2 = db.transaction(["Subjects"],"readonly");
                let objectStore2 = transaction2.objectStore("Subjects");
                let getSubjectsRequest = objectStore2.getAll();

                getSubjectsRequest.onsuccess = function(event) {
                    let result = event.target.result;
                    let table = `<h4>Oceny studenta:</h4><table class="table"> ${Grade.htmlTableHeaders()}`;
                    let rowNumber = 1;
                    grades.forEach(grade =>{
                        let subjectName = "";
                        result.forEach( subject =>{
                            if(grade.subjectId == subject.id){
                                subjectName = subject.name;
                            }
                        });
                        table += grade.tohtmlTableRow(rowNumber,subjectName);
                        rowNumber = rowNumber + 1;
                    });
                    table += "</table>";
                    document.getElementById("studentPageGradeTable").innerHTML = table;
                    grades.forEach(grade =>{
                        document.getElementById("grade"+grade.id).addEventListener("click", function(){deleteGrade(grade, student);});
                    });
                }
            } else {
                document.getElementById("studentPageGradeTable").innerHTML = "<h4>Student aktualnie nie ma zadnych ocen.</h4>";
            }
            
        }
        transaction.oncomplete = function(){
            db.close();
            console.log("Transaction has been completed.");
        }
        transaction.onerror = function(event){
            console.error("Transaction has been canceled.", event);
        }
    }
}
function showAddSubjectToStudentPage(subjects){
    if(subjects.length >0){
        document.getElementById("addSubjectToStudentPage").style.display = "block";
        document.getElementById("addGradeToStudentPage").style.display = "none";
        document.getElementById("studentPageGrades").style.display = "none";
        document.getElementById("studentPageSubjects").style.display = "none";
        let options = "";
        subjects.forEach(subject => {
            options += `<option value="${subject.id}">${subject.name}&nbsp;&nbsp;semestr: ${subject.term}</option>`;
        });
        document.getElementById("subjectsDropdown").innerHTML = options;
    } else {
        alert("Brak przedmiotów do, których student mógły być przypisany.\nNajpierw dodaj przedmiot przed przypisaniem studenta do przedmiotu!");
    }
    
}
function addSubjectToStudent(student){

    let subjectId = parseInt(document.getElementById("subjectsDropdown").value);
    student.subjects.push(subjectId);
    const request = indexedDB.open(databaseName,1);
    
    request.onsuccess = function(event){
        let db = event.target.result;
        let transaction = db.transaction(["Students"],"readwrite");
        let objectStore = transaction.objectStore("Students");
        let updateRequest = objectStore.put(student);

        updateRequest.onsuccess = function(){
            console.log("Succesfuly updated Students Subjects");
        }
        updateRequest.onerror = function(event){
            console.error("Error while updating student:",event);
        }
        transaction.oncomplete = function(){
            db.close();
            console.log("Transaction has been completed.");
            showStudentPage(student);
            showStudentSubjects(student);
        }
        transaction.onerror = function(event){
            console.error("Transaction has been canceled.", event);
        }
    }

}
function cancelAddSubjectToStudent(student){
    showStudentPage(student);
    showStudentSubjects(student);
}
function showAddGradeToStudentPage(student){
    if(student.subjects.length>0){
        document.getElementById("addSubjectToStudentPage").style.display = "none";
        document.getElementById("addGradeToStudentPage").style.display = "block";
        document.getElementById("studentPageGrades").style.display = "none";
        document.getElementById("studentPageSubjects").style.display = "none";
        const request = indexedDB.open(databaseName);
        request.onsuccess = function(event){
            let db = event.target.result;
            let transaction = db.transaction(["Subjects"], "readonly");
            let objectStore = transaction.objectStore("Subjects");
            let getRequest = objectStore.getAll();
            getRequest.onsuccess = function(event){
                let result = event.target.result;
                let select ="";
                result.forEach(subject =>{
                    student.subjects.forEach( subjectId =>{
                        if(subject.id == subjectId){
                            select += `<option value="${subject.id}">${subject.name}&nbsp;&nbsp;semestr: ${subject.term}</option>`;
                        }
                    });
                });
                document.getElementById("GradeSubject").innerHTML = select;
            }
            getRequest.onerror = function(event){
                console.error("Error while reading from Subjects", event);
            }
            transaction.oncomplete = function(){
                db.close();
                console.log("Transaction has been completed.");
            }
            transaction.onerror = function(event){
                console.error("Transaction has been canceled.", event);
            }
        }
    } else {
        alert("Student nie jest przypisany do zadnego przedmiotu.\nNajpierw przypisz studenta do przedmiotu!");
    }
    
}
function addGradeToStudent(student){
    let value = parseFloat(document.getElementById("gradeValue").value);
    let subjectId = parseInt(document.getElementById("GradeSubject").value);
    let date = Date();
    let myPromise = new Promise(function(myResolve, myReject){
        const request = indexedDB.open(databaseName,1);
        request.onsuccess = function(event){
            let db = event.target.result;
            
            let transaction = db.transaction(["Grades"],"readonly");
            let objectStore = transaction.objectStore("Grades");
            let idIndex = objectStore.index("idIndex");
            let openCursorRequest = idIndex.openCursor(null, 'prev');
            openCursorRequest.onsuccess = function(event){
                result = event.target.result;
                myResolve(result ? result.value.id : null);
            }
            openCursorRequest.onerror = function(event){
                myReject(event);
            }
            transaction.oncomplete = function(){
                db.close();
                console.log("Transaction has been completed.");
            }
            transaction.onerror = function(event){
                console.error("Transaction has been canceled.", event);
            }
        }
        request.onerror = function(event){
            console.error("Error while connecting to database:",event);
        }
    });
    myPromise.then(
        function(lastId){
            let grade;
            if(lastId != null){
                grade = new Grade(lastId +1, student.id, subjectId, value, date);
            } else {
                grade = new Grade(0, student.id, subjectId, value, date);
            }
            let request = indexedDB.open(databaseName,1);
            request.onsuccess = function(event){
                let db = event.target.result;
                let transaction = db.transaction(["Grades"], "readwrite");
                let objectStore = transaction.objectStore("Grades");
                let addRequest = objectStore.add(grade);
                addRequest.onsuccess = function(){
                    console.log("Succesfuly added grade to student");
                }
                addRequest.onerror = function(event){
                    console.error("Error while adding grade to student", event);
                }
                transaction.oncomplete = function(){
                    db.close();
                    console.log("Transaction has been completed.");
                    showStudentGrades(student);
                    showStudentPage(student);
                }
                transaction.onerror = function(event){
                    console.error("Transaction has been canceled.", event);
                }
            }
            
        },
        function(error){
            console.error("Error while getting id of the last grade:",error);
        }
    );
}
function cancelAddGradeToStudent(student){
    showStudentGrades(student);
    showStudentPage(student);
}
function deleteStudent(student){
    if(confirm("Czy napewno chcesz usunąć studenta?")){
        const request = indexedDB.open(databaseName,1);
        request.onsuccess = function(event){
            let db = event.target.result;
            let myPromise = new Promise(function(myResolve,myReject){
                let transaction = db.transaction(["Students"], "readwrite");
                let objectStore = transaction.objectStore("Students");
                let deleteRequest = objectStore.delete(student.id);
                deleteRequest.onsuccess = function(){
                    myResolve();
                }
                deleteRequest.onerror = function(event){
                    myReject(event);
                }
                transaction.oncomplete = function(){
                    console.log("Transaction has been completed.");
                }
                transaction.onerror = function(event){
                    console.error("Transaction has been canceled.", event);
                }
            });
            let transaction = db.transaction(["Grades"],"readwrite");
            let objectStore = transaction.objectStore("Grades");
            let studentIdIndex = objectStore.index("studentIdIndex");
            let getAllStudentGradesRequest = studentIdIndex.getAll([student.id]);
            getAllStudentGradesRequest.onsuccess = function(event){
                let grades = event.target.result;
                console.log("Test student grades:",grades);
                if(grades.length > 0 ){
                    grades.forEach(grade => {
                        let deleteRequest = objectStore.delete(grade.id);
                        deleteRequest.onsuccess = function(){
                            console.log("Deleted grade:", grade);
                        }
                        deleteRequest.onerror = function(event){
                            console.error("Error while deleting grade:",event);
                        }
                    });
                    myPromise.then(function(){
                        console.log("Succesfuly deleted student:", student);
                    },
                    function(event){
                        console.error("Error while deleting student:",event);
                        transaction.abort();
                    });
                }
            }
            transaction.oncomplete = function(){
                db.close();
                console.log("Transaction has been completed.");
                startConnection();
            }
            transaction.onerror = function(event){
                console.error("Transaction has been canceled.", event);
            }
        }
        request.onerror = function(event) {
            console.error("Couldn't connect to databse.", error);
        }

    } else {

    }
}
function deleteSubject(subject) {
    if (confirm("Czy na pewno chcesz usunąć przedmiot?")) {
        const request = indexedDB.open(databaseName, 1);
        request.onsuccess = function(event) {
            let db = event.target.result;
            let transaction = db.transaction(["Subjects", "Grades", "Students"], "readwrite");
            let subjectsStore = transaction.objectStore("Subjects");
            let gradesStore = transaction.objectStore("Grades");
            let studentsStore = transaction.objectStore("Students");

            console.log("Przedmiot do usunięcia id: ", subject.id);
            //usunięcie przedmiotu
            const deleteSubjectRequest = subjectsStore.delete(subject.id);
            //-------------------
            //usunięcie ocen
            let myPromise = new Promise(function(myResolve, myReject){
                let studentsIds = []
                let subjectsIndex = gradesStore.index("subjectIdIndex");
                let getGradesRequest = subjectsIndex.getAll([subject.id]);
                getGradesRequest.onsuccess = function(event){
                    let grades = event.target.result;
                    console.log("Grades readed:",grades);
                    grades.forEach( grade => {
                        const deleteGradeRequest = gradesStore.delete(grade.id);
                        studentsIds.push(grade.studentId);
                        if(grade.id == grades[grades.length-1].id){
                            myResolve(studentsIds);
                        }
                    });
                    
                }
                getGradesRequest.onerror = function(event){
                    myReject(event);
                }
            });
            //-------------------
            //usunięcie przedmiotu z studentów
            myPromise.then(
                function(studentsIds){
                    let studentsIdsSet = new Set(studentsIds);
                    let i = studentsIdsSet.size;
                    studentsIdsSet.forEach(studentId =>{
                        let isLast = false;
                        if(i<=1){
                            isLast = true;
                        }
                        i = i - 1;
                        let studentPromis = new Promise(function(myResolve, myReject){
                            let getStudentRequest = studentsStore.get(studentId);
                            getStudentRequest.onsuccess = function(event){
                                let student = event.target.result;
                                myResolve([student, isLast]);
                            }
                            getStudentRequest.onerror = function(event){
                                myReject(event);
                            }
                        });
                        studentPromis.then(
                            function(value){
                                let [student, isLast] = value;
                                console.log("isLast: ",isLast);
                                let newStudent = new Student(student.id, student.name, student.actualTerm, student.subjects);
                                newStudent.subjects = ArrayRemoveElement(newStudent.subjects, subject.id);
                                let updateRequest = studentsStore.put(newStudent);
                                if(isLast){
                                    showAllSubjectsPage();
                                }
                            },
                            function(error){
                                console.error("Error while reading from students:", error);
                            }
                        );
                    });
                },
                function(error){
                    console.error("Error while reading from grades:", error);
                }
            );
            //-------------------
            transaction.oncomplete = function(){
                db.close();
                console.log("Transaction has been completed.");
            }
            transaction.onerror = function(event){
                console.error("Transaction has been canceled.", event);
            }
        }
        request.onerror = function(event) {
            console.error("Error while opening DataBase:",event);
        }
    }
}
function deleteGrade(grade,student){
    if(confirm("Czy napewno chcesz usunąć ocenę?")){
        const request = indexedDB.open(databaseName,1);
        request.onsuccess = function(event){
            let db = event.target.result;
            let transaction = db.transaction(["Grades"], "readwrite");
            let objectStore = transaction.objectStore("Grades");
            let deleteRequest = objectStore.delete(grade.id);
            deleteRequest.onsuccess = function(){
                console.log("Succesfuly deleted grade:",grade);
            }
            deleteRequest.onerror = function(event){
            }
            transaction.oncomplete = function(){
                db.close();
                console.log("Transaction has been completed.");
                showStudentGrades(student);
                showStudentPage(student);
            }
            transaction.onerror = function(event){
                console.error("Transaction has been canceled.", event);
            }
        }
    } else {}
}
function showAllSubjectsPage(){
    const request = indexedDB.open(databaseName,1);
    request.onsuccess = function(event) {
        let db = event.target.result;
        let transaction = db.transaction(["Subjects"], "readonly");
        let objectStore = transaction.objectStore("Subjects");
        let getRequest = objectStore.getAll();
        getRequest.onsuccess = function(event){
            let allSubjects = event.target.result;
            if(allSubjects.length>0){
                let subjects = allSubjects.map(subject =>{
                    return new Subject(subject.id, subject.name, subject.term);
                });
                let table = `<h3>Baza przedmiotów</h3><hr><table class="table">${Subject.htmlTableHeadersCancel()}`;
                let rowNumber = 1;
                subjects.forEach(subject =>{
                    table += subject.tohtmlTableRowCancel(rowNumber);
                    rowNumber = rowNumber + 1;
                });
                table += "</table>";
                document.getElementById("allSubjectsPageTable").innerHTML = table;
                subjects.forEach(subject =>{
                    document.getElementById("subject"+subject.id).addEventListener("click", function(){deleteSubject(subject);});
                });
            }else{
                document.getElementById("allSubjectsPage").innerHTML = "<h3>Baza przedmiotów jest pusta</h3><br><h4>Dodaj nowy przedmiot.</h4>";
            }
        }
        transaction.oncomplete = function(){
            db.close();
            console.log("Transaction has been completed.");
            //-------setting visible elements
                document.getElementById("refreshButton").style.display = "none";
                document.getElementById("addStudentForm").style.display = "none";
                document.getElementById("tableContainer").style.display = "none";
                document.getElementById("studentPage").style.display = "none";
                document.getElementById("addSubjectForm").style.display = "none";
                document.getElementById("addSubjectToStudentPage").style.display = "none";
                document.getElementById("addGradeToStudentPage").style.display = "none";
                document.getElementById("allSubjectsPage").style.display = "block";
            //-----------------------
        }
        transaction.onerror = function(event){
            console.error("Transaction has been canceled.", event);
        }
    }
}
//--------------------event listeners------------
document.getElementById("refreshButton").addEventListener("click", startConnection);
document.getElementById("addStudentButton").addEventListener("click", showAddStudentForm);
document.getElementById("submitAddStudent").addEventListener("click", addStudent);
document.getElementById("cancelAddStudent").addEventListener("click", cancelAddStudent);
document.getElementById("header").addEventListener("click", startConnection);
document.getElementById("addSubjectButton").addEventListener("click", showAddSubjectForm);
document.getElementById("cancelAddSubject").addEventListener("click", cancelAddSubject);
document.getElementById("submitAddSubject").addEventListener("click", addSubject);
document.getElementById("showAllSubjectsButton").addEventListener("click", showAllSubjectsPage);
document.getElementById("refreshSubjectsButton").addEventListener("click", showAllSubjectsPage);
document.getElementById("showAllStudentsButton").addEventListener("click", startConnection);
//---------------------running-code--------------
startConnection();

