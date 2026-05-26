var canvas = document.querySelector('canvas');

canvas.width = window.innerWidth-20;
canvas.height = window.innerHeight-20;

var teclas = {};
var MouseX = 0;
var MouseY = 0;

document.addEventListener("keydown", (event) =>{
    teclas[event.key] = true;
});

document.addEventListener("keyup", (event) =>{
    teclas[event.key] = false;
});

document.addEventListener("mousemove", function(event){
    const rect = canvas.getBoundingClientRect();
    MouseX = event.clientX - rect.left;
    MouseY = event.clientY - rect.top;
});

var c = canvas.getContext('2d');

const MAX_DX = 30;
const MAX_DY = -50;
const pessoa_altura = 300;
const pessoa_largura = 100;

var y_bola = canvas.height - 310;
var x_bola = 70;

var x_bola_previo=200;
var y_bola_previo=200;

var tamanhobola = 10; 

var y_pessoa = canvas.height - 300;
var x_pessoa = 20;

var dx=0;
var dy=0;

var j_was_pressed = false;
var preparou= false;

function gravidade(){
    dy+= 1.5;
}

function Atrito(){
    if( Math.abs(dx)>0.5){
        if((Math.abs(dx)-0.15)<0.5) dx=0;
        else if(dx<0) dx = dx+0.15;
        else dx = dx-0.15;
        console.log(dx);
    }
    
}

function preparandoJogada(){
   if(dx < MAX_DX) dx+=1;

   if(dy< Math.abs(MAX_DY)) dy -= 1;
       
}

function Arremesso(){

    if(((x_bola + tamanhobola) >= canvas.width || x_bola <=0) && (x_bola_previo+tamanhobola)<canvas.width && x_bola_previo>0){
        if(Math.abs(dx-0.50*dx)<0.3 ) dx=0;
        else  dx  = -dx + 0.50*dx;
        console.log(dx);
    }
       
    if(( y_bola <=0 || (y_bola + tamanhobola) >= canvas.height) && (y_bola_previo+tamanhobola)<canvas.height && y_bola_previo>0){
        if(Math.abs(dy-0.50*dy)<0.3 && (y_bola + tamanhobola)>=canvas.height) dy=0; 
        else dy = -dy + 0.50*dy;
        console.log(dy);
        
    }

    x_bola_previo = x_bola;
    y_bola_previo = y_bola;
    x_bola += dx;
    y_bola += dy;

    console.log(dy);
     console.log(dx);
}


function animate(){
    
    
    
    requestAnimationFrame(animate);
    c.clearRect(0,0, innerWidth, innerHeight);
    for(let i=0 ;i*2<canvas.width; i++){
        c.fillStyle = "rgb(52,"  + (235-i*0.5 ) + ",235";  
        c.fillRect(i*2, 0, 2, innerHeight);
    }
    c.fillStyle = "black";
    c.fillRect(x_pessoa, y_pessoa, pessoa_largura, pessoa_altura);
    c.fillStyle = "#f10";
    c.beginPath();
    c.arc(x_bola, y_bola, tamanhobola, 0, Math.PI*2, false);
    c.fill();

    if(preparou) Arremesso();


   else if(teclas["j"] || teclas["J"]){
        setTimeout(() => {
            preparandoJogada();
        }, 500);
      j_was_pressed = true;
    }

    else if(j_was_pressed){ 
        preparou = true;
      
    }

    if(y_bola<(canvas.height-tamanhobola) && preparou) gravidade();
    if(preparou && (y_bola+tamanhobola)>= canvas.height) Atrito();

    
    
}

animate();