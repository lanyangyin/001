class SaveData
{
    constructor(key, convert)
    {
        this.key = key;
        this.data = {};
        this.convert = convert;
    }


    save()
    {
        var str = JSON.stringify(this.data);
        localStorage.setItem(this.key, str);
    }

    load()
    {
        var str = localStorage.getItem(this.key);
        if (StringExtension.isNullOrEmpty(str))
        {
            return false;
        }

        this.data = JSON.parse(str);
        var result = (this.data != null);
        return result;
    }

    clear()
    {
        localStorage.removeItem(this.key);
    }

    getDataStr()
    {
        var str = localStorage.getItem(this.key);
        return str;
    }

    saveItem(key, param, item)
    {
        var key = key.replace("{0}", param);
        this.data[key] = item;
    }

    saveArrayItem(key, param, array, arrayKeys = [])
    {
        if (array === null)
        {
            this.saveItem(key, param, null);
            return;
        }

        var saveArray = [];
        for (var i = 0; i < array.length; i++)
        {
            var value = null;
            if (arrayKeys.length == 0)
            {
                value = array[i];
            }
            else
            {
                var saveValue = array[i];
                for (var dataKey of arrayKeys)
                {
                    if (saveValue == null)
                    {
                        break;
                    }
                    saveValue = saveValue[dataKey];
                }
                value = saveValue;
            }

            saveArray.push(value);
        }
        this.saveItem(key, param, saveArray);
    }

    loadItem(key, param, defaultValue, getValue = null)
    {
        if (this.data == null)
        {
            return defaultValue;
        }

        var key = key.replace("{0}", param);
        var item = this.data[key];
        item = this.convert(key, item);
        if (item == null)
        {
            item = defaultValue;
        }

        if (getValue == null)
        {
            return item;
        }
        else
        {
            return getValue(item);
        }
    }

    loadArrayItem(key, param, getValue = null, defaultValue = [])
    {
        if (this.data == null)
        {
            return defaultValue;
        }

        var key = key.replace("{0}", param);
        var items = this.data[key];
        if (items == null)
        {
            return defaultValue;
        }

        if (items.length == null)
        {
            items = defaultValue;
        }

        var result = [];
        for (var item of items)
        {
            item = this.convert(key, item);
            if (getValue != null)
            {
                item = getValue(item);
            }
            result.push(item);
        }

        return result;
    }
}