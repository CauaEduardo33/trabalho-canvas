var canvas = document.querySelector('canvas');

canvas.width = window.innerWidth-20;
canvas.height = window.innerHeight-20;

console.log(canvas.height);
var teclas = {};

var previous_MouseY=0;
var MouseX = 0;
var MouseY = 0;
var primeiro_movimento = true;

document.addEventListener("keydown", (event) =>{
    teclas[event.key] = true;
});

document.addEventListener("keyup", (event) =>{
    teclas[event.key] = false;
});

document.addEventListener("mousemove", function(event){
    previous_MouseY = MouseY;
    const rect = canvas.getBoundingClientRect();
    MouseX = event.clientX - rect.left;
    MouseY = event.clientY - rect.top;
    if(primeiro_movimento){
        previous_MouseY = MouseY;
        primeiro_movimento = false;
    }
});

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

var c = canvas.getContext('2d');

const MAX_Velocidade = 200;
const pessoa_altura = 300;
const pessoa_largura = 100;




var tamanhobola = 25; 

var y_pessoa = canvas.height - 300;
var x_pessoa = 20;

const posicao_inicial_bola_y = canvas.height - y_pessoa/2
var y_bola = posicao_inicial_bola_y;
const posicao_inicial_bola_x = 100+tamanhobola;
var x_bola = posicao_inicial_bola_x;
var x_bola_previo=200;
var y_bola_previo=200;

var x_centro = x_pessoa+100;
var y_centro = y_pessoa+ pessoa_altura/2;
var radius = 50;
var angle=0;
var d_vetor= 0;
var dx_bola=0;
var dy_bola=0;


//aro: x, y, largura, altura
var aro = [0,0,80,20];

var cesta_lagura= aro[2];
var cesta_x = aro[1];
var cesta_y = aro[0]+aro[3];
var cesta_comprimento =  100; 




var j_was_pressed = false;
var preparou= false;


function gravidade(){
    dy_bola+= 1.5;
}

function Atrito(){
    if( Math.abs(dx_bola)>0.5){
        if((Math.abs(dx_bola)-0.15)<0.5) dx_bola=0;
        else if(dx_bola<0) dx_bola = dx_bola+0.15;
        else dx_bola = dx_bola-0.15;
        console.log(dx_bola);
    }
    
}

function preparandoJogada(){
    
    angle+= (MouseY-previous_MouseY)*0.01;
    previous_MouseY = MouseY;
    console.log("angulo:");
    console.log(angle);
    x_bola_previo = x_bola
    y_bola_previo = y_bola;

    x_bola = x_centro + radius*Math.cos(angle);
    y_bola = y_centro + radius*Math.sin(angle);

    

    if(d_vetor<MAX_Velocidade){
        d_vetor+=1;
    }

    dx_bola = Math.cos(angle)*d_vetor;
    dy_bola = Math.sin(angle)*d_vetor;

    c.fillStyle = "white";

    for(let i=1; i<=6; i++){
       
        let t = i*0.3;

        let bola_preview_direcao_x;
        let bola_preview_direcao_y;

        bola_preview_direcao_x = dx_bola*t; 
        bola_preview_direcao_y = dy_bola*t + 1.5*(t*t)/2;

        c.beginPath();
        c.arc(x_bola+bola_preview_direcao_x, y_bola+bola_preview_direcao_y, tamanhobola, 0, Math.PI*2);
        c.fill();
    }
       
}

function Arremesso(){

    if(((x_bola + tamanhobola) >= canvas.width || x_bola <=0) && (x_bola_previo+tamanhobola)<canvas.width && x_bola_previo>0){
        if(Math.abs(dx_bola-0.50*dx_bola)<0.3 ) dx_bola=0;
        else  dx_bola  = -dx_bola + 0.50*dx_bola;
        console.log(dx_bola);
    }
       
    if(( y_bola <=0 || (y_bola + tamanhobola) >= canvas.height) && (y_bola_previo+tamanhobola)<canvas.height && y_bola_previo>0){
        if(Math.abs(dy_bola-0.50*dy_bola)<0.5 && (y_bola + tamanhobola)>=canvas.height) dy_bola=0; 
        else dy_bola = -dy_bola + 0.50*dy_bola;
        console.log(dy_bola);
        
    }

    x_bola_previo = x_bola;
    y_bola_previo = y_bola;
    x_bola += dx_bola;
    y_bola += dy_bola;

    
}


function gerarPosicaoCesta(){
    aro[1] = Math.random()*(canvas.height-aro[3]-cesta_comprimento - 100 +1)+100;
}
function gerarCesta()
{
    aro[0] = canvas.width - aro[2];
    
    cesta_lagura= aro[2];
    cesta_x = aro[0];
    cesta_y = aro[1]+aro[3];

    c.fillStyle = "orange";
    c.fillRect(aro[0], aro[1], aro[2], aro[3]);

    c.fillStyle = "white";
    
    for(let i=0; i<8; i++){
        for(let j=0; j<5; j++){
            if((i%2==0 && j%2==0) || (i%2!=0 && j%2!=0))c.fillRect(cesta_x+cesta_lagura/5*j, cesta_y+cesta_comprimento/8*i, cesta_lagura/5, cesta_comprimento/8);
        }
    }
  
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
    c.fillStyle = "#eb7434";
    c.beginPath();
    c.arc(x_bola, y_bola, tamanhobola, 0, Math.PI*2, false);
    c.fill();

    gerarCesta();
    
    if(preparou) Arremesso();


   else if(teclas["j"] || teclas["J"]){
    preparandoJogada();    
    sleep(500);
    j_was_pressed = true;
    }

    else if(j_was_pressed){ 
        preparou = true;
      
    }

    if(y_bola<(canvas.height-tamanhobola) && preparou) gravidade();
    if(preparou && (y_bola+tamanhobola)>= canvas.height) Atrito();

    
    
}

gerarPosicaoCesta();
animate();