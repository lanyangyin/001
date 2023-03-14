class SurvivorManager extends GlobalManager
{
    constructor()
    {
        super("survivorManager");
        this.survivors = [];
        this.locking = null;
    }

    get mainSurvivor()
    {
        return this.survivors[0];
    }

    get validSurvivor()
    {
        for (var survivor of this.survivors)
        {
            if (survivor.isValid == false)
            {
                continue;
            }
            return survivor;
        }

        return this.mainSurvivor;
    }

    get survivorMax()
    {
        return 2;
    }

    get survivorCount()
    {
        return this.survivors.length;
    }

    updateSurvivors()
    {
        for (var survivor of this.survivors)
        {
            survivor.preUpdateCharacter();
        }

        if (this.locking != null)
        {
            this.locking.update();
        }
        else
        {
            for (var survivor of this.survivors)
            {
                if (this.locking != null)
                {
                    continue;
                }
                survivor.update();
            }
        }
    }

    updateSkills()
    {
        for (var survivor of this.survivors)
        {
            if (survivor == null)
            {
                continue;
            }
            survivor.updateSkill();
        }
    }

    pushSurvivor(survivor)
    {
        this.survivors.push(survivor);
    }

    removeSurvivor(id)
    {
        var result = null;

        for (var i = this.survivors.length; i >= 0; i--)
        {
            var survivor = this.survivors[i];
            if (survivor == null)
            {
                continue;
            }
            if (survivor.id != id)
            {
                continue;
            }

            // アイテムをすべて収納に
            for (var j = 0; j < survivor.inventory.list.length; j++)
            {
                var item = survivor.inventory.list[j];
                globalSystem.houseManager.pushItem(item);
            }

            // 生存者を除去
            this.survivors.splice(i, 1);
            result = survivor;
            break;
        }

        // index を再登録
        if (result != null)
        {
            for (var i = 0; i < this.survivors.length; i++)
            {
                this.survivors[i].index = i;
            }
        }

        return result;
    }

    getSurvivor(index)
    {
        if (index >= this.survivorCount)
        {
            return null;
        }
        var result = this.survivors[index];
        return result;
    }

    getSurvivorById(id)
    {
        for (var survivor of this.survivors)
        {
            if (survivor.id == id)
            {
                return survivor;
            }
        }
        return null;
    }

    hasItemById(id)
    {
        for (var survivor of this.survivors)
        {
            var item = survivor.getItemById(id);
            if (item != null)
            {
                return true;
            }
        }
        return false;
    }

    getItemsById(id)
    {
        var result = [];
        for (var survivor of this.survivors)
        {
            var items = survivor.getItemsById(id);
            result = result.concat(items);
        }
        return result;
    }

    getItemsByKey(key, value)
    {
        var result = [];
        for (var survivor of this.survivors)
        {
            var items = survivor.getItemsByKey(key, value);
            result = result.concat(items);
        }
        return result;
    }

    getItems()
    {
        var result = [];
        for (var survivor of this.survivors)
        {
            var items = survivor.inventory.list;
            result = result.concat(items);
        }
        return result;
    }

    removeItem(item)
    {
        for (var survivor of this.survivors)
        {
            if (survivor.removeItem(item))
            {
                return true;
            }
        }
        return false;
    }

    removeItemById(id, count)
    {
        if (count <= 0)
        {
            return [];
        }
        var removed = [];
        for (var survivor of this.survivors)
        {
            var items = survivor.getItemsById(id);
            for (var i = 0; i < items.length; i++)
            {
                if (removed.length >= count)
                {
                    break;
                }
                var item = items[i];
                survivor.removeItem(item);
                removed.push(item);
            }
        }
        return removed;
    }

    lostItem(item)
    {
        for (var survivor of this.survivors)
        {
            if (survivor.lostItem(item))
            {
                return true;
            }
        }
        return false;
    }

    lock(survivor)
    {
        this.locking = survivor;
    }

    unlock(survivor)
    {
        if (this.locking == survivor)
        {
            this.locking = null;
        }
    }

    unlockForce()
    {
        this.locking = null;
    }

    onQuestEnd(complete)
    {
        for (var survivor of this.survivors)
        {
            survivor.onQuestEnd(complete);
        }
    }

    reset()
    {
        for (var survivor of this.survivors)
        {
            survivor.reset();
            survivor.resetHp();
            survivor.resetStamina();
            survivor.resetTemporary();
        }
    }
}

new SurvivorManager();
