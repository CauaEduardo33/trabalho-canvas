var canvas = document.querySelector('canvas');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

var teclas = {};

document.addEventListener("keydown", (event) =>{
    teclas[event.key] = true;
});

document.addEventListener("keyup", (event) =>{
    teclas[event.key] = false;
});

var c = canvas.getContext('2d');

const MAX_DX = 20;
const MAX_DY = -30;
const pessoa_altura = 300;
const pessoa_largura = 100;

var y_bola = canvas.height - 310;
var x_bola = 20;

const tamanhobola = 10; 

var y_pessoa = canvas.height - 300;
var x_pessoa = 20;

var dx=0;
var dy=0;

var preparou= false;

function gravidade(){
    dy+= 1;
}

function preparandoJogada(){
   if(dx < MAX_DX) dx+=1;

   if(dy< MAX_DY) dy -= 2;
       
}

function Arremesso(){
    gravidade();
    
    
    if((x_bola+ tamanhobola) >= canvas.width || x_bola ==0 || y_bola ==0 || (y_bola + tamanhobola) == canvas.height ){
        if(Math.abs(dx-0.20*dx)<0.1) dx=0;
        else dx = -(dx- 0.20*dx);
       
        if(Math.abs(dy-0.20*dy)<0.1) dy=0; 
        else dy = -(dy - 0.20*dy);
        
    }
    
    x_bola += dx;
    y_bola += dy;
}


function animate(){
    
    
    
    requestAnimationFrame(animate);
    c.clearRect(0,0, innerWidth, innerHeight);
    c.fillStyle = "black";
    c.fillRect(x_pessoa, y_pessoa, pessoa_largura, pessoa_altura);
    c.strokeStyle = "#f10";
    c.beginPath();
    c.arc(x_bola, y_bola, tamanhobola, 0, Math.PI*2, false);
    c.stroke();

    while(teclas["j"] || teclas["J"]){
        setTimeout(() => {
            preparandoJogada();
        }, 500);

        if(!teclas["j"] && !teclas["J"]){
            preparou= true;
        }
    }

    if(preparou){
        Arremesso();
    }
    
}

animate();