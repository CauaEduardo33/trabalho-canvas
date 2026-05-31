var canvas = document.querySelector('canvas');

// Define o tamanho do canvas proporcional à janela
canvas.width = window.innerWidth * 0.98;
canvas.height = window.innerHeight * 0.96;

console.log(canvas.height);

// Registra quais teclas estão pressionadas no momento
var teclas = {};
var was_w_pressed = false;

// Rastreia posição do mouse para calcular o ângulo de arremesso
var previous_MouseY = 0;
var MouseX = 0;
var MouseY = 0;
var primeiro_movimento = true;

// Registra teclas pressionadas
document.addEventListener("keydown", (event) => {
    teclas[event.key] = true;
});

// Registra teclas soltas
document.addEventListener("keyup", (event) => {
    teclas[event.key] = false;
});

// Atualiza posição do mouse em relação ao canvas
document.addEventListener("mousemove", function(event) {
    previous_MouseY = MouseY;
    const rect = canvas.getBoundingClientRect();
    MouseX = event.clientX - rect.left;
    MouseY = event.clientY - rect.top;
    // Evita salto brusco no primeiro movimento
    if (primeiro_movimento) {
        previous_MouseY = MouseY;
        primeiro_movimento = false;
    }
});

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

var c = canvas.getContext('2d');

// Modo de jogo: 1 = single player, 2 = multiplayer
var mode = 1;

const MAX_Velocidade = 200;
const pessoa_altura = 300;
const pessoa_largura = 100;

// Jogador ativo (1 ou 2)
var player = 1;

var tamanhobola = 25;

// Posição inicial do jogador
const y_pessoa_inicial = canvas.height - 300;
const x_pessoa_inicial = 20;
var y_pessoa = y_pessoa_inicial;
var x_pessoa = x_pessoa_inicial;

// Posição X do jogador no momento do arremesso (para calcular pontuação)
var x_pessoa_arremesso;

// Velocidade vertical do jogador (para pulo)
var dy_player = 0;

// Calcula posição inicial Y da bola (na altura da cintura do jogador)
var posicao_inicial_bola_y = function() {
    return y_pessoa + pessoa_altura / 2;
};

var y_bola = posicao_inicial_bola_y();

// Calcula posição inicial X da bola (ao lado do jogador)
var posicao_inicial_bola_x = function() {
    return x_pessoa + pessoa_largura + 20;
};

var x_bola = posicao_inicial_bola_x();
var x_bola_previo = 200;
var y_bola_previo = 200;

// Centro do círculo de mira e raio da órbita da bola durante o preparo
var x_centro = x_pessoa + 100;
var y_centro = y_pessoa + pessoa_altura / 2;
var radius = 50;

// Ângulo e vetores de velocidade da bola
var angle = 0;
var d_vetor = 0;
var dx_bola = 0;
var dy_bola = 0;

// Regiões do fundo com cores diferentes indicando valor dos pontos
var twopoints_bckg = [0, 0, canvas.width * 0.25, canvas.height, "#1E3A8A"];      // vale 2 pontos
var onepoint_bckg  = [canvas.width * 0.25, 0, canvas.width * 0.5, canvas.height, "#3B82F6"]; // vale 1 ponto
var cesta_bckg     = [canvas.width * 0.5, 0, canvas.width, canvas.height, "#627D93"]; // área da cesta

// Dados do aro: [x, y, largura, altura]
var aro = [0, 0, 80, 20];

var cesta_lagura    = aro[2];
var cesta_x         = aro[1];
var cesta_y         = aro[0] + aro[3];
var cesta_comprimento = 100;

// Controles de estado do turno
var q_was_pressed    = false;
var preparou         = false;  // jogador está em fase de arremesso
var arremesso_completo = false;

// Controles de pontuação
var veio_de_cima = false; // bola passou por cima do aro antes de entrar
var pontuou      = false;
var pontos1      = 0;
var pontos2      = 0;

const gravidade = 1.5;


// Aplica atrito horizontal quando a bola está no chão
function Atrito() {
    if ((Math.abs(dx_bola) - 0.15) < 0.5) dx_bola = 0;
    else if (dx_bola < 0) dx_bola = dx_bola + 0.15;
    else dx_bola = dx_bola - 0.15;
    console.log(dx_bola);
}

// Desenha o fundo, variando conforme o estado do jogo
function drawBackground() {
    if (!jogoIniciado || JogoFinalizado) {
        c.fillStyle = "#3B82F6";
        c.fillRect(0, 0, canvas.width, canvas.height);
        return;
    }
    c.fillStyle = twopoints_bckg[4];
    c.fillRect(twopoints_bckg[0], twopoints_bckg[1], twopoints_bckg[2], twopoints_bckg[3]);

    c.fillStyle = onepoint_bckg[4];
    c.fillRect(onepoint_bckg[0], onepoint_bckg[1], onepoint_bckg[2], onepoint_bckg[3]);

    c.fillStyle = cesta_bckg[4];
    c.fillRect(cesta_bckg[0], cesta_bckg[1], cesta_bckg[2], cesta_bckg[3]);
}

// Desenha a imagem do jogador ativo
function drawPlayer() {
    var jogador_image;
    if (player == 1) jogador_image = document.getElementById("jogador1");
    else if (player == 2) jogador_image = document.getElementById("jogador2");
    c.drawImage(jogador_image, x_pessoa, y_pessoa);
}

// Desenha a bola como círculo laranja
function drawBall() {
    c.fillStyle = "#eb7434";
    c.beginPath();
    c.arc(x_bola, y_bola, tamanhobola, 0, Math.PI * 2, false);
    c.fill();
}

// Calcula a velocidade após colisão com parede ou chão, com amortecimento de 50%
function ColisaoBola(d_bola, eixo, pos_eixo_bola = 0, tamanho_bola = tamanhobola) {
    if (eixo == 'x') {
        // Zera se a velocidade resultante for muito baixa
        if (Math.abs(d_bola - 0.50 * d_bola) < 0.3) d_bola = 0;
        else d_bola = -d_bola + 0.50 * d_bola;
    } else if (eixo == 'y') {
        // Zera se a bola parou no chão com velocidade residual
        if (Math.abs(d_bola - 0.50 * d_bola) < 0.5 && (pos_eixo_bola + tamanho_bola) >= canvas.height) d_bola = 0;
        else d_bola = -d_bola + 0.50 * d_bola;
    }
    console.log(d_bola);
    return d_bola;
}

// Reseta posição do jogador e bola para o início do turno
function reinicializarJogador() {
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
    d_vetor = 0;
    dx_bola = 0;
    dy_bola = 0;
    primeiro_movimento = true;
    arremesso_completo = false;
    gerarPosicaoCesta(); // sorteia nova posição da cesta
}

// Processa entradas do teclado para mover o jogador
function playerMovement() {
    // Pulo: aplica impulso vertical apenas uma vez por pressionamento
    if ((teclas["w"] || teclas["W"]) && !was_w_pressed) {
        dy_player -= Math.sqrt(2 * gravidade * 200);
        was_w_pressed = true;
    }

    // Movimento horizontal com limite nas bordas do campo
    if ((teclas["a"] || teclas["A"]) && (x_pessoa - 1.5) > 0) x_pessoa -= 1.5;
    if ((teclas["d"] || teclas["D"]) && (x_pessoa + pessoa_largura + 2 * tamanhobola + 1.5) < (canvas.width - cesta_lagura - 20)) x_pessoa += 1.5;

    // Enquanto não está arremessando, mantém a bola colada ao jogador
    if (!preparou) {
        y_bola = posicao_inicial_bola_y();
        x_bola = posicao_inicial_bola_x();
        x_centro = x_pessoa + 100;
        y_centro = y_pessoa + pessoa_altura / 2;
    }
}

// Aplica gravidade e colisão com o chão ao jogador
function atualizarPessoa_Y() {
    if ((y_pessoa + pessoa_altura) > canvas.height && dy_player != 0) {
        // Jogador tocou o chão: reseta velocidade vertical
        dy_player = 0;
        y_pessoa = canvas.height - 300;
        was_w_pressed = false;
    } else if (dy_player != 0) {
        y_pessoa += dy_player;
        dy_player += gravidade;
        sleep(500);
    }
}

// Controla a fase de mira: orbita a bola ao redor do jogador e mostra trajetória prevista
function preparandoJogada() {
    // Atualiza ângulo conforme movimento vertical do mouse
    angle += (MouseY - previous_MouseY) * 0.01;
    previous_MouseY = MouseY;
    console.log("angulo:");
    console.log(angle);

    x_bola_previo = x_bola;
    y_bola_previo = y_bola;

    // Posiciona a bola em órbita circular ao redor do centro
    x_bola = x_centro + radius * Math.cos(angle);
    y_bola = y_centro + radius * Math.sin(angle);

    // Aumenta a potência do arremesso até o limite máximo
    if (d_vetor < MAX_Velocidade) d_vetor += 1;

    dx_bola = Math.cos(angle) * d_vetor;
    dy_bola = Math.sin(angle) * d_vetor;

    // Desenha 6 pontos brancos simulando a trajetória futura com gravidade
    c.fillStyle = "white";
    for (let i = 1; i <= 6; i++) {
        let t = i * 0.3;
        let bola_preview_direcao_x = dx_bola * t;
        let bola_preview_direcao_y = dy_bola * t + 1.5 * (t * t) / 2;
        c.beginPath();
        c.arc(x_bola + bola_preview_direcao_x, y_bola + bola_preview_direcao_y, tamanhobola, 0, Math.PI * 2);
        c.fill();
    }
}

// Atualiza posição da bola durante o voo e trata colisões com paredes e aro
function Arremesso() {
    // Colisão com parede lateral ou com as laterais do aro
    if (
        (((x_bola + tamanhobola) >= canvas.width || x_bola <= 0) && (x_bola_previo + tamanhobola) < canvas.width && x_bola_previo > 0) ||
        ((x_bola - tamanhobola) >= (aro[0] + aro[2] / 20 - 2) && (x_bola - tamanhobola) <= (aro[0] + aro[2] * 0.035) && y_bola >= (aro[1] + tamanhobola) && y_bola <= (aro[1] + aro[3] + tamanhobola)) ||
        ((x_bola + tamanhobola) >= aro[0] && x_bola <= aro[0] && y_bola > (aro[1] - tamanhobola) && y_bola < (aro[1] + aro[3] + tamanhobola))
    ) {
        dx_bola = ColisaoBola(dx_bola, 'x');
    }

    // Colisão com teto ou chão
    if ((y_bola <= 0 || (y_bola + tamanhobola) >= canvas.height) && (y_bola_previo + tamanhobola) < canvas.height && y_bola_previo > 0) {
        dy_bola = ColisaoBola(dy_bola, 'y', y_bola, tamanhobola);
    }

    x_bola_previo = x_bola;
    y_bola_previo = y_bola;
    x_bola += dx_bola;
    y_bola += dy_bola;

    // Arremesso encerrado quando a bola para completamente
    if (dx_bola == 0 && dy_bola == 0) arremesso_completo = true;
}

// Sorteia uma posição vertical aleatória para a cesta a cada turno
function gerarPosicaoCesta() {
    aro[1] = Math.random() * (canvas.height - aro[3] - cesta_comprimento - 100 + 1) + 100;
}

// Desenha a cesta: aro laranja + rede xadrez branca abaixo
function gerarCesta() {
    aro[0] = canvas.width - aro[2]; // fixa a cesta na borda direita

    cesta_lagura = aro[2];
    cesta_x = aro[0];
    cesta_y = aro[1] + aro[3];

    // Desenha o aro
    c.fillStyle = "orange";
    c.fillRect(aro[0], aro[1], aro[2], aro[3]);

    // Desenha o padrão xadrez da rede
    c.fillStyle = "white";
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 5; j++) {
            if ((i % 2 == 0 && j % 2 == 0) || (i % 2 != 0 && j % 2 != 0))
                c.fillRect(cesta_x + cesta_lagura / 5 * j, cesta_y + cesta_comprimento / 8 * i, cesta_lagura / 5, cesta_comprimento / 8);
        }
    }
}

// Verifica se a bola entrou na cesta de cima para baixo e atribui pontos
function verificarCesta() {
    if (!veio_de_cima) {
        // Aguarda a bola passar acima do aro antes de considerar cesta válida
        if (x_bola >= cesta_x && x_bola <= (cesta_x + cesta_lagura) && (y_bola + tamanhobola) < aro[1]) {
            veio_de_cima = true;
        }
    } else if (!pontuou && x_bola >= (cesta_x + cesta_lagura / 20) && y_bola > aro[1] && y_bola < (cesta_y + cesta_comprimento) && y_bola_previo < y_bola && dy_bola >= 0) {
        // Bola descendo dentro da cesta: pontua
        pontuou = true;
        var i_pontos = 1;
        if (x_pessoa_arremesso <= twopoints_bckg[2]) i_pontos = 2; // arremesso de além da linha vale 2
        if (player == 1) pontos1 += i_pontos;
        else if (player == 2) pontos2 += i_pontos;
    } else if (y_bola > aro[1]) {
        // Bola saiu pela base sem entrar: reseta flag
        veio_de_cima = false;
    }
}

// Exibe placar no canto superior esquerdo (e direito no modo 2)
function escreverPontuacao() {
    c.font = "48px impact";
    c.fillText(pontos1, 50, 68);
    if (mode == 2) {
        c.fillText(pontos2, canvas.width - 50, 68);
    }
}

var jogoIniciado = false;
var JogoFinalizado = false;

function escreverNomeJogo(){
    c.fillStyle = "white";
    c.font = "40px impact";
    c.textAlign = "center";
    c.textBaseline = "middle";
    const x = canvas.width/2;
    const y = 20;
    c.fillText("Lance ou danse", x, y);
    c.fillStyle = "#eb7434";
    c.beginPath();
    c.arc(x, 100, 50, 0, Math.PI*2);
    c.fill();

    
}

// Tela inicial: aguarda o jogador escolher o modo
function selectMode() {

    escreverNomeJogo();
    c.fillStyle = "white";
    c.font = "20px impact";
    const texto_selectmode = "Pressione 1 para single player ou pressione 2 para multijogador";
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillText(texto_selectmode, canvas.width / 2, canvas.height / 2);

    if (teclas["1"]) { mode = 1; jogoIniciado = true; }
    else if (teclas["2"]) { mode = 2; jogoIniciado = true; }
}

// Alterna o jogador ativo ao fim de um turno sem cesta
function switchPlayers() {
    if (!pontuou) {
        switch (player) {
            case 1: player = 2; break;
            case 2: player = 1; break;
        }
    }
}

// Reseta todo o estado do jogo para uma nova partida
function reinicializarJogo() {
    jogoIniciado = false;
    JogoFinalizado = false;
    player = 1;
    reinicializarJogador();
    pontos1 = 0;
    pontos2 = 0;
}

// Tela de fim de jogo: mostra o vencedor e aguarda reinício
function finaldeJogo() {
    var texto_fim_de_jogo = "";
    if (mode == 2) {
        if (pontos1 >= 10) texto_fim_de_jogo = "O jogador 1 venceu! ";
        else if (pontos2 >= 10) texto_fim_de_jogo = "O jogador 2 venceu! ";
        else texto_fim_de_jogo = "Houve um empate! ";
    }
    texto_fim_de_jogo = texto_fim_de_jogo + "Pressione 's' para começar outra partida";

    c.fillStyle = "white";
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillText(texto_fim_de_jogo, canvas.width / 2, canvas.height / 2);

    if (teclas["s"] || teclas["S"]) reinicializarJogo();
}

// Loop principal do jogo, chamado a cada frame pelo requestAnimationFrame
function animate() {
    requestAnimationFrame(animate);
    c.clearRect(0, 0, innerWidth, innerHeight);

    drawBackground();

    if (!jogoIniciado) selectMode();

    else if (JogoFinalizado) finaldeJogo();

    else {
        drawPlayer();
        drawBall();
        gerarCesta();
        escreverPontuacao();
        verificarCesta();

        playerMovement();
        atualizarPessoa_Y();

        if (preparou) Arremesso();

        // Q mantido: modo de mira ativo
        else if (teclas["q"] || teclas["Q"]) {
            preparandoJogada();
            sleep(500);
            q_was_pressed = true;
        }

        // Q solto após ter sido pressionado: dispara o arremesso
        else if (q_was_pressed) {
            preparou = true;
            x_pessoa_arremesso = x_pessoa;
        }

        // Aplica gravidade à bola enquanto está no ar
        if (y_bola < (canvas.height - tamanhobola) && preparou) dy_bola += gravidade;

        // Aplica atrito quando a bola toca o chão
        if (preparou && (y_bola + tamanhobola) >= canvas.height) Atrito();

        // Fim do turno: troca jogador (modo 2) e reinicia posições
        if (arremesso_completo) {
            if (mode == 2) switchPlayers();
            reinicializarJogador();
        }

        // E encerra o jogo manualmente, ou automaticamente quando um jogador atinge 10 pontos
        if (teclas["e"] || teclas["E"] || (mode == 2 && ((player == 1 && pontos1 >= 10) || (player == 2 && pontos2 >= 10))))
            JogoFinalizado = true;
    }
}

// Inicializa a cesta e começa o loop do jogo
gerarPosicaoCesta();
animate();