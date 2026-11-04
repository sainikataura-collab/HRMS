//  
// Type: XmlUtility
//  
//  
//  


using System.Text;
using System.Text.RegularExpressions;
using System.Xml;
using System.Xml.Serialization;

public class XmlUtility
{
  public static string CleanXmlString(string inputString)
  {
    inputString = ((IEnumerable<char>) "☺☻♥♦♣♠•◘○'‘’¢©÷·¶±€£®§™¥°÷×\x00BE¢¡¿☼♀♂♪♫◄√↑↓→←∟↕↔ \n”".ToCharArray()).Aggregate<char, string>(inputString, (Func<string, char, string>) ((current, c) => current.Replace(c, ' ')));
    inputString = inputString.Replace("–", "-");
    inputString = Regex.Replace(inputString, "<\\?xml.*=\"utf-8\"\\?>", "", RegexOptions.IgnoreCase);
    return inputString.Replace("&", "&amp;");
  }

  public static string FormatXml(string xml)
  {
    string str = "";
    MemoryStream memoryStream = new MemoryStream();
    XmlTextWriter xmlTextWriter = new XmlTextWriter((Stream) memoryStream, Encoding.Unicode);
    XmlDocument xmlDocument = new XmlDocument();
    try
    {
      xmlDocument.LoadXml(xml);
      xmlTextWriter.Formatting = Formatting.Indented;
      xmlDocument.WriteContentTo((XmlWriter) xmlTextWriter);
      xmlTextWriter.Flush();
      memoryStream.Flush();
      memoryStream.Position = 0L;
      str = new StreamReader((Stream) memoryStream).ReadToEnd();
    }
    catch (XmlException ex)
    {
    }
    memoryStream.Close();
    xmlTextWriter.Close();
    return str;
  }
        
  public static string XmlSerializeToString(object objectInstance)
  {
    XmlSerializer xmlSerializer = new XmlSerializer(objectInstance.GetType());
    StringBuilder sb = new StringBuilder();
    using (TextWriter textWriter = (TextWriter) new StringWriter(sb))
      xmlSerializer.Serialize(textWriter, objectInstance);
    return sb.ToString();
  }

  public static T XmlDeserializeFromString<T>(string objectData)
  {
    return (T) XmlUtility.XmlDeserializeFromString(objectData, typeof (T));
  }

  private static object XmlDeserializeFromString(string objectData, Type type)
  {
    object obj;
    using (TextReader textReader = (TextReader) new StringReader(objectData))
      obj = new XmlSerializer(type).Deserialize(textReader);
    return obj;
  }

  public static XmlElement CreateElement(XmlDocument xDoc, string name, string value)
  {
    XmlElement element = xDoc.CreateElement(name);
    element.InnerText = value;
    return element;
  }

     

    //27_feb
   
        public static string XmlSerializeToString<T>(T objectInstance)
        {
            if (objectInstance == null) return string.Empty;

            var xmlSerializer = new XmlSerializer(typeof(T));
            using (var stringWriter = new StringWriter())
            {
                using (var writer = XmlWriter.Create(stringWriter, new XmlWriterSettings { OmitXmlDeclaration = true }))
                {
                    xmlSerializer.Serialize(writer, objectInstance);
                    return stringWriter.ToString();
                }
            }
        }
    
}
