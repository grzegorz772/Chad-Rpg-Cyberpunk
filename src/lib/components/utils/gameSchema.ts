const exampleRegion = {
    "regions": {
        "001": {
            "type": "city || main || second || third || monument",
            "name": "LLM NAME",
            "description": "LLM DESCRIPTION",
            "buildings": {
                "amount": "RND NOT LLM IF == CITY",
                "id1": "RND NOT LLM",
                "id2": "RND NOT LLM",
                "id3": "RND NOT LLM",
                "id4": "RND NOT LLM"
            },
            "enemy": {
                "isEnemy": true,
                "id": "RND NOT LLM IF TRUE"
            },
            "loot": {
                "isLoot": true,
                "id": "RND NOT LLM IF TRUE"
            }  
        }
    },
}

export const exampleEnemy = {
  "001": {
    "name": "LLM NAME",
    "description": "LLM DESCRIPTION",
    "statistics": {
      "magicArmor": "RND NOT LLM%",
      "armorArmor": "RND NOT LLM%",
      "magicPenetration": "RND NOT LLM%",
      "armorPenetration": "RND NOT LLM%",
      "magicDamage": "RND NOT LLM%",
      "physicalDamage": "RND NOT LLM%",
      "imagePath": "./images/enemies/exampleEnemy.png"
    },
    "abilities": {
      "001": {
        "name": "LLM NAME",
        "description": "LLM DESCRIPTION",
        "id": "001",
        "type": "magic_damage RND",
        "value": "RND NOT LLM"
      }
    }
  }
};

const exampleAbility = {
  "001": {
    "name": "LLM NAME",
    "description": "LLM DESCRIPTION",
    "id": "001",
    "type": "RNDSTATmagic_damage RND",
    "value": "RND NOT LLM"
  }
}

const exampleBuilding = {
  "forge": {
    "type": "forge",
    "name": "LLM Anvil",
    "upgradeSystem": {
       "stat": "RND NOT LLM ALL STATUS WRITTEN IN CODE",
       "targetType": "physical",
       "maxLevel": 10,
       "costMultiplier": 1.5,
       "value": "RND NOT LLM"
    }
  }
}

const exampleItem = {
  "001": {
    "name": "LLM NAME",
    "role": { "isPhysical": false, "isMagical": false },
    "slot": { "weapon": false, "secondhand": true, "chest": false, "finger": false, "legs": false, "head": false },
    "baseStats": {
      "strength": "RND NOT LLM", "agility": "RND NOT LLM", "intelligence": "RND NOT LLM", "defense": "RND NOT LLM",
      "physical_damage": "RND NOT LLM", "magic_damage": "RND NOT LLM", "magic_penetration": "RND NOT LLM",
      "phisical_penetration": "RND NOT LLM", "armor_armor": "RND NOT LLM", "magic_armor": "RND NOT LLM"
    },
    "description": "LLM Description"
  }
}

const exampleNPC = {
    "001": {
    "name": "LLM NAME",
    "description": "LLM DESCRIPTION",
    "historyofNPC": "LLM HISTORY"
  }
}

const exampleQuest = {
  "001": {
    "name": "LLM NAME",
    "description": "LLM DESCRIPTION",
    "enemyID": "RND NOT LLM",
    "amount": "RND NOT LLM",
    "reward": "RND NOT LLM",  
  }
}

const exampleWorld = {
  "regions": {
    ////
  },
  "addedStaticData": {
    "buildings": {
        ////
    },
    "enemies": {
        ////
    },
    "items": {
        ////
    },
    "abilities": {
        ////
    },
    "NPCs": {
        ////
    },
    "quests": {
        ////
    }
  },

}