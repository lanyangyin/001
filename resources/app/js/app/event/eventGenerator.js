class EventGenerator
{
    static generate(type, arg, onEnd = null)
    {
        var event = Class.getInstance(type, arg);
        if (event == null)
        {
            return null;
        }
        if (event.valid == false)
        {
            return null;
        }
        event.onEnd = onEnd;
        return event;
    }

    static generateByData(data, onEnd = null)
    {
        var arg = [];
        arg[0] = data.arg0;
        arg[1] = data.arg1;
        arg[2] = data.arg2;
        arg[3] = data.arg3;
        arg[4] = data.arg4;
        arg[5] = data.arg5;
        arg[6] = data.arg6;
        arg[7] = data.arg7;
        arg[8] = data.arg8;
        arg[9] = data.arg9;
        arg[10] = data.arg10;
        arg[11] = data.arg11;
        arg[12] = data.arg12;
        return EventGenerator.generate(data.classType, arg, onEnd);
    }

    static generateById(id)
    {
        var eventData = globalSystem.eventData.getDataById(id);
        if (eventData == null)
        {
            return null;
        }

        var result = EventGenerator.generateByData(eventData);
        return result;
    }
}
