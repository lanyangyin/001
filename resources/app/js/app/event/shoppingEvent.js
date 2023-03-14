class ShoppingEvent extends Event
{
    constructor()
    {
        super("shopping", 0, -1);

        this.products = [];
        this.productPrices = [];
        this.productItems = [];
    }

    static get coinItemId()
    {
        return "coin00";
    }

    static get exchangeResult()
    {
        var result =
        {
            success: 0,
            noPrices: 1,
            countMax: 2,
        };
        return result;
    }

    setupEvent(survivor, stage)
    {
        var count = 4;// + Random.range(2);
        var products = this.getProducts(count);
        this.products = [];
        this.productPrices = [];
        for (var data of products)
        {
            this.products.push(data.product);
            this.productPrices.push(data.price);
        }
        this.productItems = this.getProductItems(this.products);
        this.speakProducts(survivor);

        var coinCount = this.getItemCount(ShoppingEvent.coinItemId);
        survivor.speak("confirmShopping", [coinCount]);

        globalSystem.survivorManager.lock(survivor);
    }

    executeEvent(survivor, stage)
    {
        globalSystem.uiManager.textLine[survivor.index].setState(TextLine.state.waiting);

        var input = globalSystem.uiManager.textInput[survivor.index].getConverted();
        if (StringExtension.isNullOrEmpty(input))
        {
            return false;
        }

        for (var i = 0; i < this.products.length; i++)
        {
            var item = this.productItems[i];
            if (ItemExecutor.getName(item) == input)
            {
                var text = globalSystem.uiManager.textInput[survivor.index].text;
                globalSystem.uiManager.textInput[survivor.index].reset();
                globalSystem.uiManager.textLine[survivor.index].writeInput(text);

                var result = this.exchange(this.products[i], this.productItems[i], this.productPrices[i]);
                switch (result)
                {
                    case ShoppingEvent.exchangeResult.success:
                        {
                            survivor.speak("shoppingSuccess", []);
                            survivor.speak("confirmShoppingMore", []);
                            this.productPrices = this.getPrices(this.products, this.productPrices);
                            return false;
                        }
                    case ShoppingEvent.exchangeResult.noPrices:
                        {
                            survivor.speak("shoppingFailed", []);
                            survivor.speak("confirmShoppingMore", []);
                            return false;
                        }
                    case ShoppingEvent.exchangeResult.countMax:
                        {
                            survivor.speak("shoppingCountMax", []);
                            survivor.speak("confirmShoppingMore", []);
                            return false;
                        }
                    default:
                        break;
                }
            }
        }

        if (input == "no")
        {
            var text = globalSystem.uiManager.textInput[survivor.index].text;
            globalSystem.uiManager.textInput[survivor.index].reset();
            globalSystem.uiManager.textLine[survivor.index].writeInput(text);

            survivor.speak("ok", []);
            return true;
        }

        return false;
    }

    exitEvent(survivor, stage)
    {
        globalSystem.survivorManager.unlock(survivor);
    }

    getProducts(count)
    {
        var corrects = globalSystem.shopData.getDatasByRandom((data) =>
        {
            for (var scenario of data.requireScenarios)
            {
                if (StringExtension.isValid(scenario) && globalSystem.scenarioManager.isFinished(scenario) == false)
                {
                    return false;
                }
            }
            return true;
        });

        var exchangeables = [];
        var disexchangeables = [];
        for (var product of corrects)
        {
            var exchangeable = this.isExchangeable(product);
            if (exchangeable.result)
            {
                exchangeables.push({ product: product, price: exchangeable.price });
            }
            else
            {
                disexchangeables.push({ product: product, price: exchangeable.price });
            }
        }

        var list = exchangeables.concat(disexchangeables);
        var result = [];
        for (var i = 0; i < list.length; i++)
        {
            var data = list[i];
            var isAlready = false;
            for (var already of result)
            {
                if (already.product.item == data.product.item)
                {
                    isAlready = true;
                    break;
                }
            }
            if (isAlready)
            {
                continue;
            }
            result.push(data);

            if (result.length >= count)
            {
                break;
            }
        }
        return result;
    }

    getProductItems(products)
    {
        var result = [];
        for (var product of products)
        {
            var productItem = globalSystem.itemData.getDataById(product.item);
            if (productItem == null)
            {
                continue;
            }
            result.push(productItem);
        }
        return result;
    }

    speakProducts(survivor)
    {
        for (var i = 0; i < this.productItems.length; i++)
        {
            this.speakProduct(survivor, this.productItems[i], this.productPrices[i]);
        }
    }

    speakProduct(survivor, productItem, price)
    {
        if (productItem == null)
        {
            return;
        }
        var productName = ItemExecutor.getName(productItem);

        var priceItems = [];
        for (var data of price)
        {
            priceItems.push(data.item);
        }
        var list = ItemExecutor.getItemNames(priceItems, null, false);
        if (list.length == 0)
        {
            return;
        }
        var priceNames = "";
        for (var i = 0; i < list.length; i++)
        {
            priceNames += list[i].name;
            //if (list[i].count > 1)
            {
                priceNames += ` x${list[i].count}`;
            }
            if (i < list.length - 1)
            {
                priceNames += Terminology.get("selection_comma");
            }
        }

        survivor.speak("showProduct", [productName, priceNames]);
    }

    exchange(product, productItem, price)
    {
        if (StringExtension.isValid(product.countMax))
        {
            var max = Number(product.countMax);
            var count = this.getItemCount(product.item);
            if (count >= max)
            {
                return ShoppingEvent.exchangeResult.countMax;
            }
        }

        for (var data of price)
        {
            if (data.result == false)
            {
                return ShoppingEvent.exchangeResult.noPrices;
            }
        }

        for (var data of price)
        {
            data.owner.removeItem(data.item);
        }

        var item = globalSystem.itemData.getDataById(product.item);
        if (item == null)
        {
            return ShoppingEvent.exchangeResult.noPrices;
        }
        item.variable = productItem.variable;
        item.accessory = productItem.accessory;

        var result = price[0].owner.pushItem(item, false);
        if (result == false)
        {
            result = globalSystem.houseManager.pushItem(item, false);
        }
        return ShoppingEvent.exchangeResult.success;
    }

    getPrices(products, oldPrices = [])
    {
        var result = [];
        var index = 0;
        for (var product of products)
        {
            var oldPrice = null;
            if (index < oldPrices.length)
            {
                oldPrice = oldPrices[index];
            }

            var data = this.isExchangeable(product, oldPrice);
            if (data != null)
            {
                result.push(data.price);
            }
            index++;
        }
        return result;
    }

    isExchangeable(product, oldPrices = [])
    {
        var removeSuccess = true;
        var priceItems = [];
        var primaryOwner = null;
        var index = -1;
        for (var price of product.price)
        {
            index++;
            var oldPrice = null;
            if (index < oldPrices.length)
            {
                var oldData = oldPrices[index];
                if (oldData != null && oldData.item != null)
                {
                    oldPrice = oldData.item.id;
                }
            }

            var foundItem = false;
            for (var survivor of globalSystem.survivorManager.survivors)
            {
                var data = this.findItem(product.priceType, price, survivor, oldPrice);
                if (data.result)
                {
                    priceItems.push(data);
                    data.owner.removeItem(data.item);
                    foundItem = true;
                    primaryOwner = survivor;
                    break;
                }
            }
            if (foundItem)
            {
                continue;
            }

            var data = this.findItem(product.priceType, price, globalSystem.houseManager, oldPrice);
            if (data.result)
            {
                priceItems.push(data);
                data.owner.removeItem(data.item);
                foundItem = true;
                if (primaryOwner == null)
                {
                    primaryOwner = globalSystem.houseManager;
                }
            }
            if (foundItem)
            {
                continue;
            }

            priceItems.push(data);
            removeSuccess = false;
        }

        for (var data of priceItems)
        {
            if (data.result == false)
            {
                continue;
            }
            data.owner.pushItem(data.item);
        }

        var price = [];
        for (var data of priceItems)
        {
            price.push(data.item);
        }

        var result = { result: removeSuccess, owner: primaryOwner, price: priceItems };

        // 所持数上限を超えていれば、結果だけfalseに
        if (StringExtension.isValid(product.countMax))
        {
            var max = Number(product.countMax);
            var count = this.getItemCount(product.item);
            if (count >= max)
            {
                result.result = false;
            }
        }

        return result;
    }

    findItem(type, arg, owner, oldItemId = null)
    {
        if (StringExtension.isValid(oldItemId))
        {
            type = "id";
            arg = oldItemId;
        }

        var result = { result: false, item: null, owner: owner };
        switch (type)
        {
            case "id":
                {
                    var item = owner.getItemById(arg);
                    if (item != null)
                    {
                        result.item = item;
                        result.result = true;
                    }
                    else
                    {
                        result.item = globalSystem.itemData.getDataById(arg);
                        result.result = false;
                    }
                }
                break;
            case "tag":
                {
                    var list = owner.getItemsByKey("tag", arg);
                    for (var i = list.length - 1; i >= 0; i--)
                    {
                        if (ItemExecutor.isLostable(list[i]) == false)
                        {
                            list = List.remove(list, list[i]);
                        }
                    }
                    if (list.length > 0)
                    {
                        var index = Random.range(list.length);
                        result.item = list[index];
                        result.result = true;
                    }
                    else
                    {
                        var list = globalSystem.itemData.getDatasByKey("tag", arg);
                        for (var i = list.length - 1; i >= 0; i--)
                        {
                            if (ItemExecutor.isLostable(list[i]) == false)
                            {
                                list = List.remove(list, list[i]);
                            }
                        }
                        if (list.length > 0)
                        {
                            var index = Random.range(list.length);
                            result.item = list[index];
                        }
                        result.result = false;
                    }
                }
                break;
            default:
                break;
        }

        if (result.item == undefined)
        {
            return false;
        }

        return result;
    }

    getItemCount(item)
    {
        var survivorsItems = globalSystem.survivorManager.getItemsById(item);
        var houseItems = globalSystem.houseManager.getItemsById(item);
        var result = survivorsItems.length + houseItems.length;
        return result;
    }

    getUseStamina()
    {
        return 0;
    }
}
