class Character
{
    constructor(data)
    {
        this.data = data;
        this.id = data.id;
        this.name = data.name;
        this.hpMax = Number(data.hp);
        this.hp = Number(data.hp);
        this.staminaMax = Number(data.stamina);
        this.stamina = Number(data.stamina);
        this.speed = Number(data.speed);
        this.atk = Number(data.atk);
        this.def = Number(data.def);
        this.weapon = null;
        this.armor = null;
        this.atkRatio = 1;
        this.defRatio = 1;
    }

    get isValid()
    {
        var result = (this.isDead == false);
        return result;
    }

    get isDead()
    {
        return this.hp <= 0;
    }

    get hpRatio()
    {
        var result = this.hp / this.hpMax;
        return result;
    }

    get staminaRatio()
    {
        var result = this.stamina / this.staminaMax;
        return result;
    }

    preUpdate()
    {
        this.preUpdateCharacter();
    }

    update()
    {
        this.updateCharacter();
    }

    reset()
    {
        this.resetCharacter();
    }

    resetHp()
    {
        this.hp = this.hpMax;
    }

    resetStamina()
    {
        this.stamina = this.staminaMax;
    }

    attack(target)
    {
        var damage = this.getAtkWithWeapon() - target.getDefWithArmor() + Random.range(5);
        if (damage <= 0)
        {
            damage = 1;
        }
        target.damage(damage, this);
        this.onAttack();
    }

    heal(point)
    {
        this.hp += parseInt(point);
        if (this.hp > this.hpMax)
        {
            this.hp = this.hpMax;
        }
        this.onHeal();
    }

    damage(point, source = null)
    {
        this.hp -= parseInt(point);
        if (isNaN(this.hp))
        {
            this.hp = 0;
        }

        this.onDamage(source);
        if (this.hp <= 0)
        {
            this.hp = 0;
            this.onDead(source);
        }
    }

    useStamina(value)
    {
        this.stamina -= value;
        this.onUseStamina();
        if (this.stamina < 0)
        {
            this.stamina = 0;
            this.onStaminaLost();
        }
    }

    recoverStamina(value)
    {
        this.stamina += value;
        if (this.stamina > this.staminaMax)
        {
            this.stamina = this.staminaMax;
        }
    }

    preUpdateCharacter()
    {
    }

    updateCharacter()
    {
    }

    resetCharacter()
    {
    }

    onAttack()
    {
    }

    onHeal()
    {
    }

    onDamage(source)
    {
    }

    onDead(source)
    {
    }

    onUseStamina()
    {
    }

    onStaminaLost()
    {
    }

    equipWeapon(weapon)
    {
        if (this.weapon == weapon)
        {
            return false;
        }
        this.weapon = weapon;
        return true;
    }

    equipArmor(armor)
    {
        if (this.armor == armor)
        {
            return false;
        }
        this.armor = armor;
        return true;
    }

    unequip(item)
    {
        this.unequipWeapon(item);
        this.unequipArmor(item);
    }

    unequipWeapon(weapon)
    {
        if (this.weapon != weapon)
        {
            return false;
        }
        this.weapon = null;
        return true;
    }

    unequipArmor(armor)
    {
        if (this.armor != armor)
        {
            return false;
        }
        this.armor = null;
        return true;
    }

    getAtkWithWeapon()
    {
        var result = this.atk;
        if (this.weapon != null)
        {
            var validWeapon = true;
            if (StringExtension.isValid(this.weapon.arg2))
            {
                // 弾があるかどうかチェック
                var item = this.inventory.getItemById(this.weapon.arg2);
                if (item == null)
                {
                    validWeapon = false;
                }
            }

            if (validWeapon)
            {
                var weaponAttack = Number(this.weapon.arg0);
                if (isNaN(weaponAttack) == false)
                {
                    result += weaponAttack;
                }
                var weaponVariable = Number(this.weapon.variable);
                if (isNaN(weaponVariable) == false)
                {
                    result += weaponVariable;
                }
            }
        }
        result *= this.atkRatio;
        return result;
    }

    getDefWithArmor()
    {
        var result = this.def;
        if (this.armor != null)
        {
            var armorDefence = Number(this.armor.arg0);
            if (isNaN(armorDefence) == false)
            {
                result += armorDefence;
            }
            var armorVariable = Number(this.armor.variable);
            if (isNaN(armorVariable) == false)
            {
                result += armorVariable;
            }
        }
        result *= this.defRatio;
        return result;
    }
}