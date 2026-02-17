import { abbreviateNumber, addScoreObserver, buyItem, changeScore, formatTime } from './currency.js';
import { effects, itemTooltipInfo, scoreObservers, settingEffects } from './data.js';
import { devModeTools, isMobile, sample } from './main.js';
import { hide, log, player } from "./player.js";
import { resetPlayerData } from './storage.js';

export function createScorePopup(value, type) {
  if (player.settings.showPopups == false) return;
  const wrapper = document.querySelector('.popup-wrapper');

  const popup = document.createElement('div');
  popup.classList.add('score-popup');

  if (type == 'borracha') {
    popup.classList.add('borracha-buffed-popup');
    popup.textContent = `+${abbreviateNumber(value)}`;
    popup.style.display = 'flex';
    popup.style.alignItems = 'center';
    popup.style.zIndex = '130'
    player.bonuses.borracha.isActive = false;

    const icon = document.createElement('img');
    icon.src = 'assets/img/item/borracha.png';
    icon.classList.add('popup-icon');

    popup.appendChild(icon);
  } else if (type == 'crit') {
    popup.classList.add('crit-popup');

    popup.textContent = `+${abbreviateNumber(value)}!`;
    const bIcon = document.createElement('img');
    const tIcon = document.createElement('img');

    bIcon.src = `assets/img/item/borracha.png`;
    tIcon.src = `assets/img/item/tijolo.png`;

    popup.appendChild(bIcon);
    popup.appendChild(tIcon);

    player.bonuses.borracha.isActive = false;
  } else if (type == 'tijolo') {
    popup.classList.add('tijolo-popup');
    const icon = document.createElement('img');
    icon.src = `assets/img/item/tijolo.png`;

    popup.textContent = `+${abbreviateNumber(value)}`;
    popup.appendChild(icon);
  } else {
    popup.textContent = `+${abbreviateNumber(value)}`;
  }

  const wrapperWidth = wrapper.clientWidth;
  const wrapperHeight = wrapper.clientHeight;

  const randomX = Math.random() * (wrapperWidth - 20);
  const randomY = Math.random() * (wrapperHeight - 20);

  popup.style.left = `${randomX}px`;
  popup.style.top = `${randomY}px`;
  popup.style.zIndex = "-1";

  wrapper.appendChild(popup);

  popup.addEventListener('animationend', () => popup.remove());
}

export function devModeInfo() {
  if (isMobile()) {
    const dock = document.querySelector('#dev-mode-panel');
    const button = document.querySelector('#dev-mode-info');
    const closeButton = document.querySelector('#dev-mode-panel > #close-button');

    const toggleVisibility = function() {
      toggleWithAnimation(dock, 'shopGuiOpen', '1.5s');
    }

    closeButton.addEventListener('click', toggleVisibility);
    button.addEventListener('click', toggleVisibility);
    
  } else {
    const button = document.getElementById("dev-mode-info");
    const info = document.getElementById("dev-mode-details");
    const closeButton = document.querySelector(
      "#dev-mode-details > #close-button",
    );

    closeButton.addEventListener("click", () => info.classList.add("hide"));
    button.addEventListener("click", () => {
      info.classList.remove("hide");
    });
  }
}

function addAllDevPanelCommands() {
  addDevPanelCommand('+100 Brabas', () => {devModeTools({key: "p"})});
  addDevPanelCommand('+1 BpS', () => {devModeTools({key: "o"})});
  addDevPanelCommand('Resetar Brabas', () => {devModeTools({key: "l"})});
  addDevPanelCommand('Testar Status Effect', () => {devModeTools({key: "["})});
  addDevPanelCommand('Definir Brabas', () => {devModeTools({key: "i"})});
  addDevPanelCommand('<i>Em breve...</i>', () => {console.log('foo')});
}
addAllDevPanelCommands();

function addDevPanelCommand(name, callback) {
  const dock = document.querySelector('#dev-mode-panel > #content');

  const newButton = document.createElement('button');
  dock.appendChild(newButton);
  newButton.classList.add('dev-panel-button');
  
  if (name) newButton.innerHTML = name;

  newButton.addEventListener('click', callback);
}

const unlockableButtons = [
  { name: "shop", element: document.getElementById('shop-button'), minScore: 40 },
  { name: "settings", element: document.getElementById('settings-button'), minScore: 10 },
]

export function unlockGuiButtons() {
  unlockableButtons.forEach(object => {
    if (object.minScore <= player.score) {
      object.element.classList.remove('hide');
      object.element.style.animation = "guiButtonPopup 1s ease-out forwards";
    }
  })
}
/**
 * Helper function that applies animation and hide-show logic depending on the element's state, using a predefined CSS animation.
 * @param {node} element - Element to apply
 * @param {string} animation - CSS Animation
 * @param {string} duration - Animation duration
 */
export function toggleWithAnimation(element, animation, duration = '1s') {
  if (element.dataset.animating === 'true') return;

  const isHidden = element.classList.contains('hide');
  element.dataset.animating = 'true';

  if (isHidden) {
    element.classList.remove('hide');
    forceReflow(element);
    element.style.animation = `${animation} ${duration} ease forwards`;
    element.addEventListener('animationend', () => {
      element.dataset.animating = 'false';
    }, { once: true });
  } else {
    forceReflow(element);
    element.style.animation = `${animation} ${duration} ease reverse`;
    element.addEventListener('animationend', () => {
      element.classList.add('hide');
      element.dataset.animating = 'false';
    }, { once: true });
  }
}

function forceReflow(element) {
  element.style.animation = `none`;
  return element.offsetHeight;
}

let isSettingsOpen = false;

export function toggleSettings() {
  const settingsGui = document.querySelector('.settings-main-gui');
  const button = unlockableButtons[1].element;

  if (isSettingsOpen) {
    button.style.pointerEvents = `none`;
    forceReflow(settingsGui);
    settingsGui.style.animation = "settingsGuiOpen 1s reverse";
    button.classList.remove('selected-gui-button');

    backdropToClose.classList.add('hide');
    settingsGui.addEventListener('animationend', () => {
      settingsGui.classList.add('hide');
      button.style.pointerEvents = `all`;
    }, { once: true });

    isSettingsOpen = false;
  } else {
    settingsGui.classList.remove('hide');
    forceReflow(settingsGui);
    settingsGui.style.animation = "settingsGuiOpen 1s forwards";

    button.classList.add('selected-gui-button');
    isSettingsOpen = true;
    backdropToClose.classList.remove('hide');
  }
}

document.querySelector('.settings-main-gui > #close-button').addEventListener('click', toggleSettings);
unlockableButtons[1].element.addEventListener('click', toggleSettings);

let isShopOpen = false;
export function toggleShop() {
  const shopGui = document.querySelector('.shop-main-gui')
  const button = unlockableButtons[0].element;

  if (isShopOpen) {
    button.style.pointerEvents = `none`;
    forceReflow(shopGui);
    shopGui.style.animation = 'shopGuiOpen 0.75s reverse';
    unlockableButtons[0].element.classList.remove('selected-gui-button');
    isShopOpen = false;
    backdropToClose.classList.add('hide');
    shopGui.addEventListener('animationend', () => {
      if (isShopOpen == false) {
        shopGui.classList.toggle('hide')
        button.style.pointerEvents = `all`;
      }
    }, { once: true })
  } else {
    shopGui.style.animation = "none";
    shopGui.offsetHeight;
    shopGui.style.animation = 'shopGuiOpen 0.75s forwards';
    unlockableButtons[0].element.classList.add('selected-gui-button');
    isShopOpen = true;
    shopGui.classList.toggle('hide');
    backdropToClose.classList.remove('hide');
  }
}

unlockableButtons[0].element.addEventListener('click', toggleShop)
document.querySelector('.shop-main-gui > #close-button').addEventListener('click', toggleShop)

export function closeAllGUIs() {
  backdropToClose.classList.add('hide');
  if (isShopOpen) {
    unlockableButtons[0].element.click();
  }
  if (isSettingsOpen) {
    unlockableButtons[1].element.click();
  }

  // changelog too
  if (isChangelogOpen) {
    changelogButton.click()
  }

  // skin menu as well
  const selectMenu = document.getElementById('button-skin-select');
  if (!selectMenu.classList.contains('hide')) {
    selectMenu.classList.add('hide');
  }
}
const backdropToClose = document.querySelector('.backdrop-closeable');
backdropToClose.addEventListener('click', closeAllGUIs);

let isChangelogOpen = false;
const changelogButton = document.querySelector('#changelog-button');

changelogButton.addEventListener('click', () => {
  const changelogGui = document.querySelector('#changelog');

  changelogGui.classList.toggle('hide');
  backdropToClose.classList.toggle('hide')
  isChangelogOpen = !isChangelogOpen;
})

export const shopItems = [];

export function createShopItem(id, name, cost, costFactor, minScore, description, image, tier, appliesOnlyStats) {
  const item = {
    id: id,
    name: name,
    cost: Number(cost),
    costFactor: Number(costFactor),
    minScore: Number(minScore),
    description: description,
    image: image,
    tier: tier,
    appliesOnlyStats: appliesOnlyStats
  }
  shopItems.push(item);
  return item
}

export function appendShopItem(item) {
  const createdItem = document.createElement('div');
  const shopElement = document.querySelector('.shop-main-gui');

  shopElement.appendChild(createdItem);
  createdItem.classList.add('item', 'hide');
  createdItem.id = `${item.id}-div`

  const itemName = document.createElement('h1');
  itemName.innerHTML = `${item.name}`;
  itemName.classList.add('item-title');
  createdItem.appendChild(itemName)

  const itemDescription = document.createElement('p');
  itemDescription.innerHTML = `${item.description}`;
  itemDescription.classList.add('item-description');
  createdItem.appendChild(itemDescription)

  const itemImage = document.createElement('img');
  itemImage.src = item.image;
  itemImage.classList.add('item-image');
  createdItem.appendChild(itemImage);
  if (item.tier >= 0 && item.tier < 6) {
    itemImage.classList.add(`tier-${item.tier}`);
  } else {
    throw new Error(`${item.name}'s tier is not in range (${item.tier})`);
  }

  setTimeout(() => {
    addHoverTooltip('default', itemImage, "", () => itemTooltipInfo[item.id](player, item), null);
  }, 5);

  const itemCost = document.createElement('div');
  itemCost.innerHTML = `B$ ${abbreviateNumber(item.cost)}`;
  itemCost.classList.add('item-cost');
  createdItem.appendChild(itemCost);

  const itemBuyButton = document.createElement('div');
  itemBuyButton.textContent = "Comprar";
  itemBuyButton.classList.add('item-buy-button');
  createdItem.appendChild(itemBuyButton);

  const itemCountDisplay = document.createElement('span');
  itemCountDisplay.classList.add('item-count-display');
  itemName.appendChild(itemCountDisplay);

  item.element = createdItem;
  item.baseCost = item.cost;
  item.buttonElement = itemBuyButton;
  item.costDisplay = itemCost;
  item.countDisplay = itemCountDisplay;

  itemBuyButton.addEventListener('click', () => {
    buyItem(item, player);
  }
  )
};

const tips = ["Já tentou usar o tijolo e a borracha no mesmo clique?", "Itens novos surgem quando sua quantidade de brabas atinge um certo ponto", "Você pode clicar no botão e apertar Espaço para clicar", "É possível saber se modo Dev foi usado ou não", "Inspiração possui a menor curva de preço", "Cadeira e Carteira formam uma ótima sinergia", "O bônus do microfone desaparece após exatamente 1.5s", "Esse jogo foi criado apenas com JS base!", "Esse jogo ainda está em desenvolvimento!", "Você pode clicar com o botão direito no botão para algo surpreendente", "Paciência muitas vezes é a chave", "O Tijolo é capaz de multiplicar o bônus da Borracha também"]
function showRandomTip() {
  if (player.settings?.showTips && Math.random() < 0.2) {
    broadcast({
      text: sample(tips),
      color: "gray",
      duration: 5,
      position: "bottom",
      size: 20
    })
  }
}

setInterval(showRandomTip, 30000);

function revealItemsWithMinScore() {
  shopItems.forEach(item => {
    if ((player.score >= item.minScore && item.element.classList.contains('hide'))) {
      item.element.classList.remove('hide');
    }
  })
}

function updateBuyButtonColor() {
  shopItems.forEach(item => {
    if (player.score >= item.cost) {
      const buyButton = item.buttonElement;
      buyButton.classList.remove('unbuyable');
      buyButton.innerHTML = "Comprar";
    } else {
      const buyButton = item.buttonElement;
      buyButton.classList.add('unbuyable');
      buyButton.innerHTML = `❌ ${abbreviateNumber(item.cost)}`;
    }
  })
}

const tooltip = document.createElement('div');
document.body.appendChild(tooltip);
tooltip.classList.add('tooltip', 'hide');

const tooltipComponentsWrapper = document.createElement('div');
tooltipComponentsWrapper.classList.add('tooltip-wrapper')
tooltip.appendChild(tooltipComponentsWrapper)

const tooltipTitle = document.createElement('h1');
const tooltipDescription = document.createElement('p');
const tooltipTime = document.createElement('div');

tooltipComponentsWrapper.appendChild(tooltipTitle);
tooltipComponentsWrapper.appendChild(tooltipDescription);
tooltipComponentsWrapper.appendChild(tooltipTime);

export function addHoverTooltip(type, element, title, description, effectEndTime) {
  let intervalID;
  element.addEventListener('mouseenter', () => {
    tooltip.classList.remove('hide');
    
    if (typeof title === 'function') {
      tooltipTitle.innerHTML = title();
    } else {
      tooltipTitle.innerHTML = title;
    }

    if (typeof description === 'function') {
      tooltipDescription.innerHTML = description();
    } else {
      tooltipDescription.innerHTML = description;
    }

    if (effectEndTime != null) {
      intervalID = setInterval(() => {
        const timeLeft = effectEndTime - Date.now();
        tooltipTime.innerHTML = `⏳ ${formatTime(timeLeft)
          }`;
        if (timeLeft <= 0) {
          tooltip.classList.add('hide');
          clearInterval(intervalID);
        }
      }, 50)
    } else {
      tooltipTime.innerHTML = ``;
    }
  });

  
  element.addEventListener('mousemove', (event) => {
    if (!isMobile()) {
      tooltip.style.left = `${event.clientX + 15}px`;
    } else {
      tooltip.style.left = `${event.clientX - tooltip.clientWidth / 2}px`;
    }
    tooltip.style.top = `${(event.clientY - tooltip.clientHeight) - 10}px`;
  });

  element.addEventListener('mouseleave', () => {
    tooltip.classList.add('hide');
    tooltipTitle.innerHTML = '';
    tooltipDescription.innerHTML = '';
    clearInterval(intervalID);
  })
}


export const settings = [];

export function createSetting(name, title, type, defaultValue, minValue, maxValue, description) {
  const setting = {
    name: name,
    title: title,
    type: type,
    defaultValue: defaultValue,
    minValue: minValue,
    maxValue: maxValue,
    description: description
  }

  settings.push(setting);
  return setting;
}

export function updateSetting(settingName, value) {
  player.settings[settingName] = value;
  if (settingEffects[settingName]) {
    settingEffects[settingName](value);
  }
};

export function appendSetting(setting) {
  const settingsGui = document.querySelector('.settings-main-gui');
  const createdSetting = document.createElement('div');
  createdSetting.classList.add('setting-div', 'dark-mode-affected');
  createdSetting.id = setting.name;
  settingsGui.appendChild(createdSetting);
  setting.element = createdSetting;

  const settingTitle = document.createElement('h1');
  settingTitle.textContent = setting.title;
  createdSetting.appendChild(settingTitle);

  const settingDescription = document.createElement('p');
  settingDescription.innerHTML = setting.description;
  createdSetting.appendChild(settingDescription);

  const settingButton = document.createElement('input');
  createdSetting.appendChild(settingButton);

  if (setting.type === "number") {
    settingButton.type = "range";
    settingButton.classList.add('settings-slider');
    settingButton.min = setting.minValue;
    settingButton.max = setting.maxValue;
    settingButton.step = 1;
    settingButton.value = setting.defaultValue;

    const valueDisplay = document.createElement('label');
    valueDisplay.textContent = setting.defaultValue;

    const wrapper = document.createElement('div');
    wrapper.appendChild(settingButton);
    wrapper.appendChild(valueDisplay);
    createdSetting.appendChild(wrapper);

    updateSetting(setting.defaultValue);

    setting.numberDisplayElement = valueDisplay;

    settingButton.addEventListener('input', () => {
      valueDisplay.textContent = settingButton.value;
      updateSetting(setting.name, settingButton.value);
    });

  } else if (setting.type === "checkbox") {
    settingButton.type = "checkbox";
    settingButton.classList.add('settings-checkbox');
    settingButton.checked = setting.defaultValue === "true" || setting.defaultValue === true;
    createdSetting.appendChild(settingButton);

    updateSetting(setting.name, settingButton.checked);

    settingButton.addEventListener('change', () => {
      updateSetting(setting.name, settingButton.checked)
    });

  } else if (setting.type === "input") {
    settingButton.type = "text";
    settingButton.classList.add('settings-inputfield');
    settingButton.value = setting.defaultValue;
    createdSetting.appendChild(settingButton);

    settingButton.addEventListener('input', () => {
      updateSetting(setting.name, settingButton.value);
    });

  } else if (setting.type === "button") {
    settingButton.classList.add('hide');
    var button = document.createElement('button');
    button.classList.add('settings-button-setting');
    button.innerHTML = setting.defaultValue; // importante
    createdSetting.appendChild(button);

    button.addEventListener('click', () => {
      updateSetting(setting.name, 1);
    })

  } else {
    throw new Error(`${setting.name} has invalid type (${setting.type})`);
  }

  setting.buttonElement = (setting.type === "button") ? button : settingButton;
}

export function openDataDeletionScreen() {
  const screen = document.getElementById('confirm-data-delete-wrapper');

  if (screen.classList.contains('hide')) {
    screen.classList.remove('hide');
  }

  const yesButton = document.getElementById('delete-yes');
  const noButton = document.getElementById('delete-no');

  yesButton.addEventListener('click', () => {
    resetPlayerData();
  }, { once: true })

  noButton.addEventListener('click', () => {
    screen.classList.add('hide');
  }, { once: true });
}

export let progressBars = [];

export function drawProgressBar(barObj) {
  const existing = document.getElementById(barObj.id);
  if (existing) return;

  const wrapper = document.createElement("div");
  wrapper.classList.add("progress-wrapper");
  wrapper.id = barObj.id;

  if (barObj.icon) {
    const img = document.createElement("img");
    img.src = barObj.icon;
    img.classList.add("progress-icon");
    wrapper.appendChild(img);
  }

  const text = document.createElement("span");
  text.classList.add("progress-label");
  if (barObj.label == "timer") {
    text.innerHTML = `${barObj.current}s`;
  } else {
    text.innerHTML = barObj.label
    ? `${barObj.label}: ${barObj.current} / ${barObj.max}`
    : `${barObj.current} / ${barObj.max}`;
  }
  wrapper.appendChild(text);

  const bar = document.createElement("div");
  bar.classList.add("progress-bar");
  wrapper.appendChild(bar);

  const fill = document.createElement("div");
  fill.classList.add("progress-fill");
  fill.style.width = `${Math.min((barObj.current / barObj.max) * 100, 100)}%`;
  fill.style.backgroundColor = barObj.color;
  bar.appendChild(fill);


  const container = document.getElementById(barObj.containerId) || document.querySelector('#progress-bars-wrapper');
  container.appendChild(wrapper);

  barObj.element = wrapper;
  progressBars.push(barObj);

  return wrapper;
}

export function getProgressBar(id) {
  return progressBars.find(element => id === element.id);
}

export function updateProgressBar(id, { current, max, color, label }) {
  const wrapper = document.getElementById(id);
  if (!wrapper) return;

  const fill = wrapper.querySelector(".progress-fill");
  const text = wrapper.querySelector(".progress-label");

  if (fill && typeof current === "number" && typeof max === "number") {
    const percent = Math.min((current / max) * 100, 100);
    fill.style.width = `${percent}%`;
  }

  fill.style.backgroundColor = color;

  if (label === "timer") {
    text.innerHTML = `${current}s`
  } else if (text && (label || typeof current === "number")) {
    text.innerHTML = label ? `${label}: ${current} / ${max}` : `${current} / ${max}`;
  }
}

export function devModeSetScore() {
  const div = document.querySelector('#set-score');
  const input = document.querySelector('#set-score > input');
  const button = document.querySelector('#set-score-confirm');
  const otherButton = document.querySelector('#set-score-cancel');
  div.classList.remove('hide');

  function setChosenScore(n) {
    log(n)
    const toAdd = Number(n || 0);
    if (toAdd >= 1e60) {
      input.value = "";
      input.placeholder = "número muito grande!";
      setTimeout(() => {input.placeholder = ""; hide(div)}, 1000);
      return;
    }
    hide(div);
    input.value = '';
    player.score = toAdd;
    changeScore('add', 0)
  }

  function getValue() {
    return Math.floor(Number(input.value));
  }

  div.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      setChosenScore(getValue());
    }
  }, {once:true});

  button.addEventListener('click', () => setChosenScore(getValue()), {once: true});

  otherButton.addEventListener('click', () => {input.value = "", hide(div)});
}
// preguiça, mas adiciona os score observers após scoreObservers[] ser inicializado
setTimeout(() => {
  addScoreObserver(revealItemsWithMinScore);
  addScoreObserver(updateBuyButtonColor);
  addScoreObserver(unlockGuiButtons);
}, 1);

// sistema rudimentar de broadcast

export function broadcast(message) {
  const broadcast = document.createElement('span');
  document.body.appendChild(broadcast)

  const text = message.text ?? ["Uma brisa leve bate lá fora.", "Parece que não há algo aqui.", "Apesar de tudo, você esqueceu dessa linha.", "Você esqueceu de definir o texto.", "Apesar de tudo, ainda é você.", "Undefined...", "Tudo o que você precisava fazer.", "Os lugares para estar."][Math.floor(Math.random() * 8)]; // saborzinho. não serve pra nada de mais, mas eu gosto de placeholders bonitinhos
  const color = message.color ?? "#000000";
  const size = message.size ?? 10
  const duration = message.duration ?? 1;
  const position = message.position ?? "default";

  broadcast.innerText = text;
  broadcast.classList.add('broadcast');

  broadcast.style.color = color;

  broadcast.style.fontSize = `${size}px`;

  broadcast.style.animation = `fadeOut ${duration}s ease-out forwards`;
  broadcast.addEventListener('animationend', () => broadcast.remove());

  function resolvePosition(pos) {
    if (!isMobile()) return pos;

    const mobileFallbacks = {
      leftOfButton: 'bottom',
      topRight: 'top',
      topLeft: 'top'
    }
    
    return mobileFallbacks[pos] ?? pos;
  }

  switch (resolvePosition(position)) {
    case "top":
      broadcast.style.position = "fixed";
      broadcast.style.top = "90px";
    break;

    case "leftOfButton":
      broadcast.style.position = "fixed";
      broadcast.style.right = "calc(50% + (var(--scale-override) * 55px))";
      broadcast.style.textAlign = "right";
    break;
    
    case "bottom":
      broadcast.style.position = "fixed";
      broadcast.style.bottom = "100px";
    break;

    case "topLeft":
      broadcast.style.position = "fixed";
      broadcast.style.top = "0"
      broadcast.style.left = "0"

      broadcast.style.maxWidth = "40%"
      broadcast.style.textAlign = "left"

      broadcast.style.margin = "5px"
    break;

    case "topRight": 
    broadcast.style.position = "fixed";
      broadcast.style.top = "0"
      broadcast.style.right = "0"

      broadcast.style.maxWidth = "40%"
      broadcast.style.textAlign = "right"

      broadcast.style.margin = "5px"
  }
}


// troca de aparência dos botões
const button = document.getElementById('main-button');

function onButtonRightClick(event) {
  event.preventDefault();

  function isEmpty(obj) {
    return Object.keys(obj).length === 0;
  }

  if (!player.unlocks.buttons) player.unlocks.buttons = {};
  const ownedSkins = player.unlocks.buttons;


  const selectMenu = document.getElementById('button-skin-select');
  const mouseX = event.clientX;
  const mouseY = event.clientY;

  selectMenu.style.position = 'absolute';
  selectMenu.style.left = `${mouseX + 10}px`;
  selectMenu.style.top = `${mouseY + 10}px`;

  selectMenu.classList.remove('hide');
  backdropToClose.classList.remove('hide');
}

button.addEventListener('contextmenu', onButtonRightClick);