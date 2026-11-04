using System;
using System.IO;
using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Configuration;

namespace HRMSWebAPI.Helper
{
    public class EncryptionHelper
    {
        private readonly string _encryptionKey;
        private readonly byte[] _salt;

        // Constructor to inject IConfiguration and get the encryption key from appsettings.json
        public EncryptionHelper(IConfiguration configuration)
        {
            _encryptionKey = configuration["EncryptionSettings:EncryptionKey"];
            _salt = Encoding.ASCII.GetBytes(_encryptionKey.Length.ToString()); // Use a strong salt
        }

        // Encrypt the plain text using AES
        public string Encrypt(string plainText)
        {
            using (Aes aes = Aes.Create())
            {
                // Generate the key and IV using a secure derivation method (PBKDF2)
                var keyDerivation = new Rfc2898DeriveBytes(_encryptionKey, _salt, 10000); // 10000 iterations for PBKDF2
                aes.Key = keyDerivation.GetBytes(32); // 256-bit key
                aes.IV = keyDerivation.GetBytes(16); // 128-bit IV

                using (var encryptor = aes.CreateEncryptor(aes.Key, aes.IV))
                using (var memoryStream = new MemoryStream())
                {
                    using (var cryptoStream = new CryptoStream(memoryStream, encryptor, CryptoStreamMode.Write))
                    {
                        byte[] plainBytes = Encoding.UTF8.GetBytes(plainText);
                        cryptoStream.Write(plainBytes, 0, plainBytes.Length);
                        cryptoStream.FlushFinalBlock();

                        return Convert.ToBase64String(memoryStream.ToArray());
                    }
                }
            }
        }

        // Decrypt the encrypted text using AES
        public string Decrypt(string cipherText)
        {
            using (Aes aes = Aes.Create())
            {
                // Generate the key and IV using the same derivation method
                var keyDerivation = new Rfc2898DeriveBytes(_encryptionKey, _salt, 10000);
                aes.Key = keyDerivation.GetBytes(32); // 256-bit key
                aes.IV = keyDerivation.GetBytes(16); // 128-bit IV

                using (var decryptor = aes.CreateDecryptor(aes.Key, aes.IV))
                using (var memoryStream = new MemoryStream(Convert.FromBase64String(cipherText)))
                using (var cryptoStream = new CryptoStream(memoryStream, decryptor, CryptoStreamMode.Read))
                {
                    byte[] decryptedBytes = new byte[cipherText.Length];
                    int decryptedCount = cryptoStream.Read(decryptedBytes, 0, decryptedBytes.Length);
                    return Encoding.UTF8.GetString(decryptedBytes, 0, decryptedCount);
                }
            }
        }
    }
}
