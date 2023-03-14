class DataHolder
{
    constructor(name)
    {
        this.name = name;
        this.paths = [];
        this.subPaths = [];
        this.datas = [];
        this.subDatas = [];
        this.loadFlags = [];
        this.loadFlagsSub = [];
        this.dicts = [];
        this.isCompleted = false;

        globalSystem.registerHolder(name, this);
    }

    static get defaultPath()
    {
        return "default";
    }

    static get defaultType()
    {
        var result = DataHolder.types[0];
        return result;
    }

    static get types()
    {
        var result = ["jpn", "eng", "chs", "cht"];
        return result;
    }

    static normalize(data)
    {
        for (var i = data.length - 1; i >= 0; i--)
        {
            var item = data[i];
            if (item.id == null)
            {
                continue;
            }
            if (StringExtension.isNullOrEmpty(item.id) == false)
            {
                continue;
            }
            data.splice(i, 1);
        }
    }

    static isIdUnique(list)
    {
        for (var item1 of list)
        {
            for (var item2 of list)
            {
                if (item1 == item2)
                {
                    continue;
                }
                if (item1.id == item2.id)
                {
                    return false;
                }
            }
        }
        return true;
    }

    static concatItem(item1, item2)
    {
        for (var key of Object.keys(item2))
        {
            if (key in item1)
            {
                continue;
            }
            item1[key] = item2[key];
        }
    }

    get isLoading()
    {
        for (var flag of this.loadFlags)
        {
            if (flag)
            {
                return true;
            }
        }
        for (var flag of this.loadFlagsSub)
        {
            if (flag)
            {
                return true;
            }
        }
        return false;
    }

    get isComplete()
    {
        if (this.loadFlags.length == 0)
        {
            return false;
        }

        if (this.isLoading)
        {
            return false;
        }

        if (this.isCompleted == false)
        {
            this.isCompleted = true;
            this.setupDatas();
            this.setupSubDatas();
            this.switchDatas(DataHolder.defaultType);
            this.setupDict();
            this.onLoad();
        }

        return true;
    }

    get isGetShallowCopy()
    {
        return false;
    }

    setupPath(paths)
    {
        this.paths = paths;

        for (var i = 0; i < this.paths.length; i++)
        {
            for (var j = i + 1; j < this.paths.length; j++)
            {
                if (this.paths[i] == this.paths[j])
                {
                    this.paths[i] = null;
                    break;
                }
            }
        }
        this.paths = this.paths.filter(n => n !== null);
    }

    setupSubPath(paths)
    {
        this.subPaths = paths;

        for (var i = 0; i < this.subPaths.length; i++)
        {
            for (var j = i + 1; j < this.subPaths.length; j++)
            {
                if (this.subPaths[i] == this.subPaths[j])
                {
                    this.subPaths[i] = null;
                    break;
                }
            }
        }
        this.subPaths = this.subPaths.filter(n => n !== null);
    }

    load()
    {
        for (var i = 0; i < this.paths.length; i++)
        {
            var index = i;
            this.loadFlags[index] = true;

            CsvLoader.load(this, this.paths[index], (function (index)
            {
                return function (owner, result)
                {
                    if (result != null)
                    {
                        owner.datas[index] = result;
                    }
                    owner.loadFlags[index] = false;
                };
            })(i));
        }

        for (var i = 0; i < this.subPaths.length; i++)
        {
            var index = i;
            this.loadFlagsSub[index] = true;

            CsvLoader.load(this, this.subPaths[index], (function (index)
            {
                return function (owner, result)
                {
                    if (result != null)
                    {
                        owner.subDatas[index] = result;
                    }
                    owner.loadFlagsSub[index] = false;
                };
            })(i));
        }
    }

    getLength(index)
    {
        return this.datas[index].length;
    }

    setup()
    {
    }

    onLoad()
    {
    }

    onShallowCopied(data)
    {
        return data;
    }

    setupDatas()
    {
        for (var data of this.datas)
        {
            DataHolder.normalize(data);
        }
    }

    setupSubDatas()
    {
        for (var data of this.subDatas)
        {
            DataHolder.normalize(data);
        }

        for (var pathIndex = 0; pathIndex < this.subPaths.length; pathIndex++)
        {
            var subPath = this.subPaths[pathIndex];
            var types = DataHolder.types;
            for (var type of types)
            {
                if (subPath.indexOf(`/${type}/`) == -1)
                {
                    continue;
                }

                var defaultPath = subPath.replace(type, DataHolder.defaultPath);
                var defaultIndex = -1;
                for (var i = 0; i < this.paths.length; i++)
                {
                    if (this.paths[i] == defaultPath)
                    {
                        defaultIndex = i;
                        break;
                    }
                }
                if (defaultIndex == -1)
                {
                    continue;
                }

                var defaultData = this.datas[defaultIndex];
                var subData = this.subDatas[pathIndex];
                if (DataHolder.isIdUnique(defaultData))
                {
                    for (var subItem of subData)
                    {
                        for (var defaultItem of defaultData)
                        {
                            if (subItem.id == defaultItem.id)
                            {
                                DataHolder.concatItem(defaultItem, subItem);
                                break;
                            }
                        }
                    }
                }
                else
                {
                    for (var i = 0; i < defaultData.length; i++)
                    {
                        if (i >= subData.length)
                        {
                            console.error("サブデータの結合に失敗しました。" + subPath);
                            break;
                        }
                        var defaultItem = defaultData[i];
                        var subItem = subData[i];
                        if (defaultItem.id != subItem.id)
                        {
                            console.error("サブデータの結合に失敗しました。" + subPath);
                            continue;
                        }
                        DataHolder.concatItem(defaultItem, subItem);
                    }
                }
            }
        }
    }

    switchDatas(type)
    {
        var tag = `<${type}>`;
        for (var data of this.datas)
        {
            for (var item of data)
            {
                for (var key of Object.keys(item))
                {
                    if (key.indexOf(tag) == -1)
                    {
                        continue;
                    }
                    var name = key.replace(tag, "");
                    item[name] = item[key];
                }
            }
        }
    }

    setupDict()
    {
        this.dicts = this.createDicts("id");
    }

    createDicts(key)
    {
        var dicts = [];
        for (var data of this.datas)
        {
            var dict = {};
            for (var item of data)
            {
                if (item[key] == null)
                {
                    continue;
                }
                if (dict[item[key]] == null)
                {
                    dict[item[key]] = [];
                }
                dict[item[key]].push(item);
            }
            dicts.push(dict);
        }

        return dicts;
    }

    concatDatas(concatKey)
    {
        for (var i = 1; i < this.datas.length; i++)
        {
            for (var additional of this.datas[i])
            {
                // 同じkeyのデータに追加
                var added = false;
                for (var data of this.datas[0])
                {
                    if (data[concatKey] != additional[concatKey])
                    {
                        continue;
                    }
                    for (var key of Object.keys(additional))
                    {
                        data[key] = additional[key];
                    }
                    added = true;
                    break;
                }

                // 同じkeyのデータがなければ、末尾に追加
                if (added == false)
                {
                    this.datas[0].push(additional);
                }
            }
        }
    }

    getDataByIndex(dataIndex, index)
    {
        return this.datas[dataIndex][index];
    }

    getDataById(id, dataIndexs = null)
    {
        var items = this.getDatasById(id, dataIndexs);
        if (items.length == 0)
        {
            return null;
        }

        return items[0];
    }

    getDatasById(id, dataIndexs = null)
    {
        if (dataIndexs == null)
        {
            dataIndexs = [];
            for (var i = 0; i < this.dicts.length; i++)
            {
                dataIndexs.push(i);
            }
        }

        var result = [];
        for (var index of dataIndexs)
        {
            var dict = this.dicts[index];
            if (dict[id] != null)
            {
                for (var item of dict[id])
                {
                    var target = item;
                    if (this.isGetShallowCopy)
                    {
                        target = {};
                        target = Object.assign(target, item);
                        target = this.onShallowCopied(target);
                    }
                    result.push(target);
                }
            }
        }
        return result;
    }

    getDataByWhere(where, dataIndexs = null)
    {
        var items = this.getDatasByWhere(where, dataIndexs);
        if (items.length == 0)
        {
            return null;
        }

        return items[0];
    }

    getDatasByWhere(where, dataIndexs = null)
    {
        if (dataIndexs == null)
        {
            dataIndexs = [];
            for (var i = 0; i < this.datas.length; i++)
            {
                dataIndexs.push(i);
            }
        }

        var result = [];
        for (var index of dataIndexs)
        {
            var data = this.datas[index];
            for (var item of data)
            {
                if (where(item) == false)
                {
                    continue;
                }

                var target = item;
                if (this.isGetShallowCopy)
                {
                    target = {};
                    target = Object.assign(target, item);
                    target = this.onShallowCopied(target);
                }
                result.push(target);
            }
        }
        return result;
    }

    getDataByKey(key, value, dataIndexs = null)
    {
        var result = this.getDataByWhere((item) => { return item[key] == value; }, dataIndexs);
        return result;
    }

    getDatasByKey(key, value, dataIndexs = null)
    {
        var result = this.getDatasByWhere((item) => { return item[key] == value; }, dataIndexs);
        return result;
    }
}
