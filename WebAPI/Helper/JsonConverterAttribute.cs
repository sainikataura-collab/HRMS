using System;

[AttributeUsage(AttributeTargets.Property)]
public class JsonConverterAttribute : Attribute
{
    public Type ConverterType { get; }

    public JsonConverterAttribute(Type converterType)
    {
        ConverterType = converterType;
    }
}
