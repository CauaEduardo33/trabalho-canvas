var canvas = document.querySelector('canvas');

canvas.width = window.innerWidth*0.98;
canvas.height = window.innerHeight*0.96;

console.log(canvas.height);
var teclas = {};
var was_w_pressed = false;

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

var mode = 1;

const MAX_Velocidade = 200;
const pessoa_altura = 300;
const pessoa_largura = 100;


var player = 1;

var tamanhobola = 25; 

const y_pessoa_inicial = canvas.height - 300;
const x_pessoa_inicial = 20;
var y_pessoa = y_pessoa_inicial;
var x_pessoa = x_pessoa_inicial;

var dy_player=0;

var posicao_inicial_bola_y = function(){ 
    return y_pessoa+pessoa_altura/2;
};

var y_bola = posicao_inicial_bola_y();
var posicao_inicial_bola_x = function(){
    return x_pessoa + pessoa_largura+ 20;
};
var x_bola = posicao_inicial_bola_x();
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




var q_was_pressed = false;
var preparou= false;
var arremesso_completo = false;

var veio_de_cima = false;
var pontuou = false;
var pontos1 = 0;
var pontos2 = 0;


const gravidade = 1.5;


function Atrito(){
    
        if((Math.abs(dx_bola)-0.15)<0.5) dx_bola=0;
        else if(dx_bola<0) dx_bola = dx_bola+0.15;
        else dx_bola = dx_bola-0.15;
        console.log(dx_bola);
    
}

function drawBackground(){
    for(let i=0 ;i*2<canvas.width; i++){
        c.fillStyle = "rgb(52,"  + (235-i*0.5 ) + ",235";  
        c.fillRect(i*2, 0, 2, innerHeight);
    }
}

function drawPlayer(){
    var jogador_image;

    if(player==1) jogador_image = document.getElementById("jogador1");    
    else if(player==2) jogador_image = document.getElementById("jogador2");
    
    c.drawImage(jogador_image, x_pessoa, y_pessoa);

}

function drawBall(){
    c.fillStyle = "#eb7434";
    c.beginPath();
    c.arc(x_bola, y_bola, tamanhobola, 0, Math.PI*2, false);
    c.fill();
}

function ColisaoBola(d_bola, eixo,pos_eixo_bola = 0, tamanho_bola = tamanhobola ){
    if(eixo=='x'){  
    if(Math.abs(d_bola-0.50*d_bola)<0.3 ) d_bola=0;
        else  d_bola  = -d_bola + 0.50*d_bola;
    }

    else if(eixo=='y'){

        if(Math.abs(d_bola-0.50*d_bola)<0.5 && (pos_eixo_bola+ tamanho_bola)>=canvas.height) d_bola=0; 
        else d_bola = -d_bola + 0.50*d_bola;
    }
        console.log(d_bola);

        return d_bola;
    }


function reinicializarJogador(){
    x_pessoa = x_pessoa_inicial;
    y_pessoa = y_pessoa_inicial;
    y_bola = posicao_inicial_bola_y();
    x_bola = posicao_inicial_bola_x();
    x_bola_previo = x_bola;
    y_bola_previo = y_bola;
    preparou = false;
    q_was_pressed = false;
    veio_de_cima = false;
    pontuou = false;
    angle = 0;
    d_vetor =0;
    dx_bola =0;
    dy_bola =0;
    primeiro_movimento = true;
    arremesso_completo = false;
    gerarPosicaoCesta();
}

function playerMovement(){
    if((teclas["w"] || teclas["W"]) && !was_w_pressed) {
        dy_player -= Math.sqrt(2*gravidade*200);
        was_w_pressed= true;

    }

    if((teclas["a"] || teclas["A"]) && (x_pessoa-1.5)>0 ) x_pessoa -= 1.5;

    if((teclas["d"] || teclas["D"]) && (x_pessoa+pessoa_largura+2*tamanhobola+1.5)<(canvas.width-cesta_lagura-20)) x_pessoa += 1.5;

    if(!preparou){
        
        y_bola = posicao_inicial_bola_y();
        x_bola = posicao_inicial_bola_x();
        x_centro = x_pessoa+100;
        y_centro = y_pessoa+ pessoa_altura/2;
    }
}

function atualizarPessoa_Y(){
        if((y_pessoa+pessoa_altura)> canvas.height && dy_player !=0){
        dy_player=0;
        y_pessoa = canvas.height - 300;
        was_w_pressed = false;
    }
    else if(dy_player !=0){
        y_pessoa += dy_player;
        dy_player += gravidade;
        
        sleep(500);
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

    if((((x_bola + tamanhobola) >= canvas.width || x_bola <=0) && (x_bola_previo+tamanhobola)<canvas.width && x_bola_previo>0) || ((x_bola-tamanhobola)>=(aro[0]+aro[2]/20-2) && (x_bola-tamanhobola)<=(aro[0]+aro[2]*0.035) && y_bola>=(aro[1]+tamanhobola) && y_bola<=(aro[1]+aro[3]+tamanhobola))){
        dx_bola = ColisaoBola(dx_bola, 'x');
    }
       
    if(( y_bola <=0 || (y_bola + tamanhobola) >= canvas.height) && (y_bola_previo+tamanhobola)<canvas.height && y_bola_previo>0){
        
        dy_bola = ColisaoBola(dy_bola, 'y', y_bola, tamanhobola);
        
    }

    x_bola_previo = x_bola;
    y_bola_previo = y_bola;
    x_bola += dx_bola;
    y_bola += dy_bola;

    if(dx_bola==0 && dy_bola ==0) arremesso_completo = true;
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

function verificarCesta(){

    if(!veio_de_cima){
        if( x_bola>=cesta_x  && x_bola<= (cesta_x+cesta_lagura) && (y_bola+tamanhobola)<aro[1] ){
            veio_de_cima = true;
        }
    }

    else if(!pontuou && x_bola>= (cesta_x+cesta_lagura/20)  && y_bola>aro[1]  && y_bola<(cesta_y+cesta_comprimento) && y_bola_previo<y_bola && dy_bola>=0){
        pontuou = true;
        if(player==1) pontos1++;
        else if(player==2) pontos2++;
    }

    else if(y_bola>aro[1]) veio_de_cima = false;

    
}

function escreverPontuacao(){
    
    
    c.font = "48px impact";
    c.fillText(pontos1, 50,68);

    if(mode==2){
        c.fillText(pontos2,canvas.width-50, 68);
    }
}


var jogoIniciado = false;
var JogoFinalizado = false;

function selectMode(){
    
    c.fillStyle = "white"
    c.font = "20px impact";
    const texto_selectmode = "Pressione 1 para single player ou pressione 2 para multijogador";
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillText(texto_selectmode,canvas.width/2, canvas.height/2);


    if(teclas["1"]){
        mode=1;
        jogoIniciado = true;
    }
    else if(teclas["2"]){
        mode=2;
        jogoIniciado = true;
 }
}

function switchPlayers(){
     if(!pontuou){
                switch(player){
                    case 1:
                        player=2;
                        break;
                    
                    case 2:
                        player=1;
                        break;
                }
            }
}

function reinicializarJogo(){
    jogoIniciado = false;
    JogoFinalizado = false;
    player = 1;
    reinicializarJogador();
    pontos1 = 0;
    pontos2 = 0;
}

function finaldeJogo(){

    var texto_fim_de_jogo="";

     if(mode==2){
           if(pontos1>=10) texto_fim_de_jogo = "O jogador 1 venceu! ";
           else if(pontos2>=10) texto_fim_de_jogo = "O jogador 2 venceu! ";
           else texto_fim_de_jogo = "Houve um empate! ";
        }
   
        texto_fim_de_jogo = texto_fim_de_jogo+ "Pressione 's' para começar outra partida";
        
        c.fillStyle = "white";
        c.textAlign = "center";
        c.textBaseline = "middle";
        c.fillText(texto_fim_de_jogo, canvas.width/2, canvas.height/2);

        if(teclas["s"] || teclas["S"]) reinicializarJogo();

}

function animate(){

    requestAnimationFrame(animate);
    c.clearRect(0,0, innerWidth, innerHeight);

    drawBackground();
    
    if(!jogoIniciado) selectMode();
    
    else if(JogoFinalizado) finaldeJogo();

    else {

    drawPlayer();
    drawBall();
    gerarCesta();
    escreverPontuacao();
    verificarCesta();

    playerMovement();
    atualizarPessoa_Y();

    if(preparou) Arremesso();

   else if(teclas["q"] || teclas["Q"]){
    preparandoJogada();    
    sleep(500);
    q_was_pressed = true;
    }

    else if(q_was_pressed)  preparou = true;
 
    if(y_bola<(canvas.height-tamanhobola) && preparou) dy_bola += gravidade;
    if(preparou && (y_bola+tamanhobola)>= canvas.height) Atrito();
    
    if(arremesso_completo){ 
        if(mode==2) switchPlayers();
        reinicializarJogador();
    }

    if(teclas["e"] || teclas["E"] || (mode==2 &&((player==1 && pontos1>=10)|| (player==2 && pontos2>=10))) )JogoFinalizado = true;
 

    }
}


gerarPosicaoCesta();
animate();