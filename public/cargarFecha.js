
let lastselected;

let currentDate = new Date();
let YEAR = currentDate.getFullYear();
let MONTH = String(currentDate.getMonth() + 1).padStart(1, '0');
let DAY = String(currentDate.getDate()).padStart(1, '0');

document.getElementById("prev").addEventListener("click", anteriorMes);
document.getElementById("next").addEventListener("click", siguienteMes);
document.getElementById("cargarFecha").addEventListener("click", cargarFecha);

let SELECTED_MONTH_DATES;
let SELECTED_MONTH = MONTH;
let SELECTED_YEAR = YEAR;
let SELECTED_DAY = DAY;

let currentDayOfWeek = currentDate.getDay();

setMes(MONTH, YEAR);

function getDayOfWeek(year, month, day) {
    month--;
    let firstDayOfMonth = new Date(year, month, day);
    let firstDayOfWeek = firstDayOfMonth.getDay();
    
    return firstDayOfWeek;
}

function getDaysInMonth(year, month) {
    return new Date(year, month, 0).getDate();
}

function setListeners(){
    let celdas = document.getElementsByClassName("cell");
    lastselected = celdas[0];
    celdas[0].style.backgroundColor = "#d0d1d0";
    for (let index = 0; index < celdas.length; index++) {
        celdas[index].addEventListener("click", seleccionar);
    }
}

function cargarFecha(){
    
    let hora = document.getElementById("hora").value;
    let materia = document.getElementById("materia").value;
    let contra = document.getElementById("contra").value;
    let nombre = document.getElementById("nombre").value;

    var requestData = {
        hora: hora,
        materia: materia,
        contra: contra,
        nombre: nombre,
        dia: SELECTED_DAY,
        mes: SELECTED_MONTH,
        year: SELECTED_YEAR,
    };
    
    console.log(requestData);
    fetch('/cf', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
    });
}

function seleccionar(evento){
    lastselected.style.backgroundColor = "#E6E8E6";
    let celdaClickeada = evento.currentTarget; 
    celdaClickeada.style.backgroundColor = "#d0d1d0";
    lastselected = celdaClickeada;
    evento.stopPropagation();
    // usar SELECTED_YEAR SELECTED_MONTH en vez de los del presente 
    diaSeleccionado( celdaClickeada.id, SELECTED_MONTH, SELECTED_YEAR );
}

function rellenarDia(data){
    //Cambiar el nombre del dia y la fecha
    document.getElementById("nombreDia").innerHTML = data.nombre;
    let dateString = `${SELECTED_DAY}-${SELECTED_MONTH}-${SELECTED_YEAR}`; 
    document.getElementById("fecha").innerHTML= dateString;

    //Rellenar cada hora con su respectiva materia
    let horasIF = ["7:30 8:10", "8:10 8:50", "9:00 9:40", "9:40 10:20", "10:30 11:10", "11:10 11:50", "12:00 12:40","12:40 13:20","13:20 14:00"];
    for (let index = 0; index < data.horas.length; index++) {
        hora =  document.getElementById(`hora${index}`);
        while (hora.firstChild) {
            hora.removeChild(hora.firstChild);
        }
        let nomMateria = document.createElement("p");
        let horaIF = document.createElement("p");
        nomMateria.innerHTML = data.horas[index];
        horaIF.innerHTML = horasIF[index];
        nomMateria.classList.add("materia");
        horaIF.classList.add("horaif");
        nomMateria.style.textDecorationColor = `var(--${data.materiaC[index]})`
        hora.appendChild(nomMateria)
        if(data.horas[index] != ""){
        hora.appendChild(horaIF);
        }
        
    }

    //Crear notificaciones de eventos dentro del dia

    SELECTED_MONTH_DATES.forEach(fecha => {
        if (fecha.dia == SELECTED_DAY){
            fecha.notis.forEach(noti => {
                hora = document.getElementById(`hora${noti.hora}`);
                notificacion = document.createElement("p");
                notificacion.innerHTML = noti.nombre;
                notificacion.classList.add("evento");
                notificacion.style.backgroundColor = `var(--${noti.color})`
                hora.appendChild(notificacion);

            });
        }
    });
}

function diaSeleccionado( day, month, year){
    diaSemana = getDayOfWeek(year,month,day)
    SELECTED_DAY = day;

    if(HORAS_SEMANA.length > 0){
        console.log(HORAS_SEMANA[diaSemana]);
        rellenarDia(HORAS_SEMANA[diaSemana]);
    }
    else{
        fetch('/horasDias', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            HORAS_SEMANA = data;
            console.log(HORAS_SEMANA);
            rellenarDia(HORAS_SEMANA[diaSemana]);
        })
        .catch(error => {
            console.error(error);
        });
    }
    
}
function setMes(month, year){

    let meses = ["Enero", "Febrero", "Marzo", "Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
    document.getElementById("nombreMes").innerHTML = meses[month - 1];

    var requestData = {
        mes: `${month}`,
        year: `${year}`
    };
    fetch('/fechasMes', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
    })
    .then(response => response.json())
    .then(data => {
        
        let calendar = document.getElementById("days");

        //Vaciar calendario

        while (calendar.firstChild) {
            calendar.removeChild(calendar.firstChild);
        }

        //Calcular offset, cantidad de dias y rellenarlo

        let offset = getDayOfWeek(year, month, 1)
        for (let index = 0; index < offset; index++) {
            empty = document.createElement("li");
            calendar.appendChild(empty);
        }
        let days = getDaysInMonth(year,month);
        for (let index = 1; index < days+1; index++) {
            let day = document.createElement("li");
            day.classList.add("cell");
            day.id = `${index}`;
            let number = document.createElement("p");
            number.innerHTML = index;
            day.appendChild(number);
            calendar.appendChild(day);
            diaSemana = getDayOfWeek(SELECTED_YEAR,SELECTED_MONTH,index) +1;
            if( diaSemana == 1 || diaSemana == 7){
                number.style.color = "#ed6a5a"
                console.log(index);
            }
        }
        
        //Agregar notificaciones a los dias del mes

        SELECTED_MONTH_DATES = data;

        data.forEach(element => {

            for (let index = 0; index < element.notis.length; index++) {
                const e = element.notis[index];
                let day = document.getElementById(element.dia);
                let noti = document.createElement("div");
                noti.classList.add("noti");
                noti.style.backgroundColor = `var(--${e.color})`
                day.appendChild(noti);

                if (index == 3){
                    
                    let mas = document.createElement("p");
                    mas.innerHTML = "...";
                    mas.classList.add("mas");
                    day.appendChild(mas);
                    break;
                }
            }
        });

        //Setear listeners y elegir "hoy" si el mes seleccionado es el actual

        setListeners();

        if(month == MONTH && year == YEAR){
            document.getElementById("1").style.backgroundColor = "#E6E8E6";
            hoy = document.getElementById(DAY);
            hoy.style.backgroundColor = "#d0d1d0";
            lastselected = hoy;
            diaSeleccionado(DAY, MONTH, YEAR);
        }
        else{
            SELECTED_DAY = 1;
            diaSeleccionado(SELECTED_DAY,SELECTED_MONTH,SELECTED_YEAR)
        }


    })
    .catch(error => {
        console.error(error);
    });
    
}

function siguienteMes(){
    if(SELECTED_MONTH == 12){
        SELECTED_MONTH = 1;
        SELECTED_YEAR++;
    }
    else{
        SELECTED_MONTH ++;
    }
    setMes(SELECTED_MONTH, SELECTED_YEAR)
}

function anteriorMes(){
    if(SELECTED_MONTH == 1){
        SELECTED_MONTH = 12;
        SELECTED_YEAR--;
    }
    else{
        SELECTED_MONTH --;
    }
    setMes(SELECTED_MONTH, SELECTED_YEAR)
}