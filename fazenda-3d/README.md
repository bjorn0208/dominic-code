# 🌾 Fazenda 3D — Simulador Isométrico

Jogo de fazenda com câmera isométrica, visual 3D estilizado (cartoon) e economia completa, desenvolvido em HTML5 Canvas puro — sem dependências, roda direto no navegador.

## Como rodar

Basta abrir `index.html` em qualquer navegador (desktop ou celular), ou servir a pasta:

```bash
npx serve .
# ou
python3 -m http.server 8000
```

## Fase 1 — Implementada ✅

### Câmera e controles
- Visão isométrica fixa (sem personagem em 3ª pessoa).
- Arrastar para mover a câmera (mouse e toque).
- Zoom com roda do mouse e pinça de dois dedos.
- Seleção de terrenos e construções por clique/toque.

### Terreno em tiles
- Grade de 30×30 tiles; área inicial possuída de 8×8.
- Tiles fora da propriedade aparecem escurecidos.
- Expansão de terreno pelo botão **Comprar** (+2 tiles em toda a borda, preço crescente).

### Sistema de construção (todos os botões funcionais)
| Botão | Função |
|---|---|
| 🪧 Construir | Abre a loja → prévia fantasma no terreno (verde = válido, vermelho = inválido) → confirmação → desconto em moedas |
| ✥ Mover | Seleciona construção, arrasta para novo local com prévia, bloqueia sobreposição/obstáculos, confirmação — **grátis** |
| ✖ Remover | Confirmação antes de remover, devolve 50% do valor investido |
| 🔄 Girar | Prévia da rotação em 90° antes de confirmar |
| 🛒 Comprar | Expansão de terreno e atalhos |

- Nenhuma construção pode sobrepôr outra (grade de ocupação).
- Atalhos: `R` gira o fantasma, `Enter` confirma, `Esc` cancela.

### Economia e progressão
- Moedas descontadas em toda compra; XP ganho ao construir.
- Níveis com barra de XP e desbloqueio por nível.
- Missões com progresso automático e recompensas.
- Conquistas de longo prazo com recompensas.
- Salvamento automático (a cada 15s) + manual nas configurações (`localStorage`).

### Interface (fiel à referência)
- Perfil com avatar, nome da fazenda, nível e barra de XP (canto superior esquerdo).
- Moedas e diamantes com lojas próprias (superior direito).
- Engrenagem: som, música, qualidade gráfica, idioma, salvar, reiniciar.
- Menu lateral: Missões, Loja, Conquistas, Amigos.
- Barra inferior: Construir, Mover, Remover, Girar, Comprar.
- Sons de interação via WebAudio (sem arquivos externos).

## Roadmap

- **Fase 2 — Agricultura:** tiles de plantio, culturas (milho, tomate, cenoura, alface, trigo) com estágios de crescimento, irrigação pelo poço, timers.
- **Fase 3 — Animais e produção:** vacas e galinhas com comportamento próprio (caminhar, alimentar, descansar), produção de leite/ovos com timers, coleta.
- **Fase 4 — Comércio:** estoque centralizado (celeiro) com limite, barraca de vendas com preços por mercadoria, ciclo PLANTAR → COLHER → ARMAZENAR → VENDER.
- **Fase 5 — Social e monetização:** amigos, presentes, loja de moedas/diamantes reais.

## Estrutura

```
index.html      — estrutura da UI
css/style.css   — estilos da interface
js/data.js      — catálogo de construções, missões, conquistas
js/iso.js       — projeção isométrica e primitivas de desenho
js/game.js      — estado, grade de ocupação, economia, save/load
js/render.js    — renderização do mundo (terreno, construções, fantasma)
js/ui.js        — HUD, painéis, modais, toasts, sons
js/main.js      — inicialização, entrada (mouse/toque/teclado), loop
```

## Correções e melhorias (revisão 2)

- **Visual:** copas de árvores e flores agora escalam corretamente com o zoom (antes ficavam como pontos quase invisíveis).
- **Celular:** `touch-action: none` no canvas (fim do scroll/zoom acidental da página); pinça de zoom não dispara mais cliques fantasma que colocavam construções por acidente; câmera não "salta" ao voltar de 2 dedos para 1; clique direito não interage mais com o mundo.
- **Girar:** a construção original não é mais desenhada sobreposta ao fantasma de rotação; girar durante o modo Mover agora é aplicado na confirmação (antes a rotação era descartada).
- **Progresso:** salvamento também ao fechar/minimizar a aba (antes era só a cada 15s); configurações mescladas com padrões ao carregar saves antigos; contadores de nível e pico de moedas sincronizados (conquistas de nível/riqueza agora registram corretamente).
- **Sem botões decorativos:** toggle de Música toca uma melodia ambiente gerada via WebAudio; opção de Idioma traduz toda a interface (pt-BR/en-US); áudio retomado corretamente no iOS; configurações são salvas ao alterar.
- **Usabilidade:** loja mostra "Sem moedas" quando não pode comprar; novo clique reposiciona o fantasma durante confirmação; `Esc` fecha modais/diálogos; barra de confirmação responsiva em telas pequenas.
