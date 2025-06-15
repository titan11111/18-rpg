document.addEventListener("DOMContentLoaded", () => {
  const field = document.getElementById("field");
  const town = document.getElementById("town");
  const shopMenu = document.getElementById("shop-menu");
  const battle = document.getElementById("battle");
  const battleLog = document.getElementById("battle-log");
  const playerHPText = document.getElementById("player-hp");
  const enemyHPText = document.getElementById("enemy-hp");
  const goldDisplay = document.getElementById("gold-display");
  const weaponDisplay = document.getElementById("weapon-display");
  const mpDisplay = document.getElementById("mp-display");
  const messageBox = document.getElementById("message-box");
  const magicMenu = document.getElementById("magic-menu");
  const itemMenu = document.getElementById("item-menu");

  const mapSize = 5;
  const mapData = [
    [0, 0, 0, 0, 0],
    [0, 2, 0, 1, 0],
    [0, 0, 0, 0, 0],
    [1, 0, 2, 0, 1],
    [0, 0, 0, 0, 0]
  ];

  let playerX = 2;
  let playerY = 2;
  let inTown = false;
  let inBattle = false;

  let playerHP = 20;
  let playerMP = 10;
  let enemyHP = 10;
  let gold = 0;
  let weapon = "なし";
  let items = { "回復薬": 1 };

  const weaponPower = {
    "なし": 0,
    "木の剣": 1,
    "鉄の剣": 3,
    "伝説の剣": 10
  };

  function showMessage(text) {
    messageBox.textContent = text;
    messageBox.classList.remove("hidden");
    setTimeout(() => {
      messageBox.classList.add("hidden");
    }, 3000);
  }

  function updateDisplays() {
    goldDisplay.textContent = `所持金：${gold} G`;
    weaponDisplay.textContent = `装備：${weapon}`;
    mpDisplay.textContent = `MP：${playerMP}`;
  }

  function drawField() {
    field.innerHTML = "";
    for (let y = 0; y < mapSize; y++) {
      for (let x = 0; x < mapSize; x++) {
        const cell = document.createElement("div");
        cell.classList.add("cell");

        if (x === playerX && y === playerY) {
          cell.classList.add("player");
          cell.textContent = "＠";
        } else if (mapData[y][x] === 1) {
          cell.classList.add("city");
        } else if (mapData[y][x] === 2) {
          cell.classList.add("enemy");
        } else {
          cell.classList.add("empty");
        }

        field.appendChild(cell);
      }
    }
  }

  function movePlayer(dx, dy) {
    if (inTown) {
      if (dx !== 0) {
        inTown = false;
        shopMenu.classList.add("hidden");
        field.classList.remove("hidden");
        town.classList.add("hidden");
        drawField();
      } else if (dy === 1) {
        shopMenu.classList.toggle("hidden");
      }
      return;
    }

    if (inBattle) return;

    const newX = playerX + dx;
    const newY = playerY + dy;

    if (newX >= 0 && newX < mapSize && newY >= 0 && newY < mapSize) {
      playerX = newX;
      playerY = newY;

      const tile = mapData[newY][newX];

      if (tile === 1) {
        inTown = true;
        field.classList.add("hidden");
        town.classList.remove("hidden");
      } else if (tile === 2) {
        inBattle = true;
        field.classList.add("hidden");
        battle.classList.remove("hidden");
        playerHP = 20;
        playerMP = 10;
        enemyHP = 10;
        updateHP();
        updateDisplays();
        battleLog.textContent = "敵があらわれた！";
        magicMenu.classList.add("hidden");
        itemMenu.classList.add("hidden");
      } else {
        drawField();
      }
    }
  }

  function updateHP() {
    playerHPText.textContent = `勇者HP：${playerHP}`;
    enemyHPText.textContent = `敵HP：${enemyHP}`;
  }

  function enemyTurn() {
    const damage = Math.floor(Math.random() * 4) + 1;
    playerHP -= damage;
    battleLog.textContent = `敵の攻撃！${damage}ダメージ！`;
    updateHP();

    if (playerHP <= 0) {
      battleLog.textContent = "勇者は倒れた……。ゲームオーバー。";
      setTimeout(() => {
        location.reload();
      }, 3000);
    }
  }

  document.querySelectorAll(".command").forEach(btn => {
    btn.addEventListener("click", () => {
      if (!inBattle) return;

      if (btn.textContent === "戦う") {
        const base = Math.floor(Math.random() * 6) + 1;
        const bonus = weaponPower[weapon] || 0;
        const damage = base + bonus;

        enemyHP -= damage;
        battleLog.textContent = weapon === "なし"
          ? `勇者の素手の攻撃！${damage}ダメージ！`
          : `勇者の攻撃！${damage}ダメージ！（${weapon}の効果）`;
        updateHP();

        if (enemyHP <= 0) {
          const earned = Math.floor(Math.random() * 10) + 5;
          gold += earned;
          updateDisplays();
          battleLog.textContent = `敵をたおした！勇者は${earned}G手に入れた。`;
          setTimeout(() => {
            inBattle = false;
            battle.classList.add("hidden");
            field.classList.remove("hidden");
            drawField();
          }, 2000);
        } else {
          setTimeout(enemyTurn, 1000);
        }

      } else if (btn.textContent === "にげる") {
        battleLog.textContent = "勇者はにげだした！";
        setTimeout(() => {
          inBattle = false;
          battle.classList.add("hidden");
          field.classList.remove("hidden");
          drawField();
        }, 1000);

      } else if (btn.textContent === "まほう") {
        magicMenu.classList.toggle("hidden");
        itemMenu.classList.add("hidden");
      } else if (btn.textContent === "どうぐ") {
        itemMenu.classList.toggle("hidden");
        magicMenu.classList.add("hidden");
      } else {
        showMessage("このコマンドはまだ使えません！");
      }
    });
  });

  document.querySelectorAll(".magic-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const name = btn.dataset.name;
      const cost = Number(btn.dataset.cost);
      if (playerMP < cost) {
        showMessage("MPがたりない！");
        return;
      }

      if (name === "ファイア") {
        enemyHP -= 8;
        playerMP -= cost;
        battleLog.textContent = `🔥ファイア！敵に8ダメージ！`;
        updateHP();
        updateDisplays();
      } else if (name === "ヒール") {
        playerHP += 10;
        if (playerHP > 20) playerHP = 20;
        playerMP -= cost;
        battleLog.textContent = `✨ヒール！HPを10回復！`;
        updateHP();
        updateDisplays();
      }

      magicMenu.classList.add("hidden");

      if (enemyHP <= 0) {
        const earned = Math.floor(Math.random() * 10) + 5;
        gold += earned;
        updateDisplays();
        battleLog.textContent = `敵をたおした！勇者は${earned}G手に入れた。`;
        setTimeout(() => {
          inBattle = false;
          battle.classList.add("hidden");
          field.classList.remove("hidden");
          drawField();
        }, 2000);
      } else {
        setTimeout(enemyTurn, 1000);
      }
    });
  });

  document.querySelectorAll(".item-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const name = btn.dataset.name;
      const price = Number(btn.dataset.price);
      if (gold >= price) {
        gold -= price;
        weapon = name;
        updateDisplays();
        showMessage(`${name}を買った！`);
      } else {
        showMessage("お金が足りません！");
      }
    });
  });

  document.querySelectorAll(".item-use-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const name = btn.dataset.name;
      if (items[name] && items[name] > 0) {
        if (name === "回復薬") {
          playerHP += 10;
          if (playerHP > 20) playerHP = 20;
          items[name]--;
          updateHP();
          showMessage("回復薬を使った！HPが10回復した！");
          itemMenu.classList.add("hidden");
          setTimeout(enemyTurn, 1000);
        }
      } else {
        showMessage("そのどうぐは持っていません！");
      }
    });
  });

  document.addEventListener("keydown", (e) => {
    switch (e.key) {
      case "ArrowUp": movePlayer(0, -1); break;
      case "ArrowDown": movePlayer(0, 1); break;
      case "ArrowLeft": movePlayer(-1, 0); break;
      case "ArrowRight": movePlayer(1, 0); break;
    }
  });

  document.getElementById("up").addEventListener("click", () => movePlayer(0, -1));
  document.getElementById("down").addEventListener("click", () => movePlayer(0, 1));
  document.getElementById("left").addEventListener("click", () => movePlayer(-1, 0));
  document.getElementById("right").addEventListener("click", () => movePlayer(1, 0));

  updateDisplays();
  drawField();
});