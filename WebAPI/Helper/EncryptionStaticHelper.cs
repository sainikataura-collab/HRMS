
using System;
using System.IO;
using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Configuration;

namespace HRMSWebAPI.Helper
{
    public static class EncryptionStaticHelper
    {
        private static readonly string _encryptionKey;
        private static readonly byte[] _salt;

        // Static constructor to read the encryption key from appsettings.json
        static EncryptionStaticHelper()
        {
            var configuration = new ConfigurationBuilder()
                .SetBasePath(Directory.GetCurrentDirectory()) // Set the base path to the current directory
                .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
                .Build();

            _encryptionKey = configuration["EncryptionSettings:EncryptionKey"];

            //_salt = Encoding.ASCII.GetBytes(_encryptionKey.Length.ToString()); // Use a strong salt

            // Use a fixed 8-byte salt to avoid issues with salt length
            _salt = new byte[] { 0x1F, 0x5C, 0x7A, 0x9B, 0xA2, 0xC3, 0xF4, 0xD5 }; // 8-byte fixed salt
        }

        // Static method to encrypt the plain text using AES and convert it to URL-safe Base64
        public static string EncryptToUrlSafeBase64(string plainText)
        {
            // Encrypt the plain text
            var encryptedBase64 = Encrypt(plainText);

            // Convert the encrypted Base64 string to URL-safe Base64
            return ConvertToUrlSafeBase64(encryptedBase64);
        }

        // Static method to decrypt the URL-safe Base64 encrypted text using AES
        public static string DecryptFromUrlSafeBase64(string urlSafeCipherText)
        {
            // Convert URL-safe Base64 back to regular Base64
            var base64String = ConvertFromUrlSafeBase64(urlSafeCipherText);

            // Decrypt the Base64 string
            return Decrypt(base64String);
        }

        // Static method to encrypt the plain text using AES
        public static string Encrypt(string plainText)
        {
            using (Aes aes = Aes.Create())
            {
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

        // Static method to decrypt the encrypted Base64 text using AES
        public static string Decrypt(string cipherText)
        {
            try
            {
                using (Aes aes = Aes.Create())
                {
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
            catch (CryptographicException ex)
            {
                // Log the error if necessary
                return null; // Return null if decryption fails due to tampering or padding issues
            }
        }

        // Method to check if a string is valid Base64
        public static bool IsBase64String(string base64String)
        {
            if (string.IsNullOrEmpty(base64String))
                return false;

            // Trim any white spaces
            base64String = base64String.Trim();

            Span<byte> buffer = new Span<byte>(new byte[base64String.Length]);
            return Convert.TryFromBase64String(base64String, buffer, out _);
        }

        // Convert regular Base64 to URL-safe Base64
        public static string ConvertToUrlSafeBase64(string base64String)
        {
            return base64String.Replace('+', '-').Replace('/', '_').TrimEnd('=');
        }

        // Convert URL-safe Base64 back to regular Base64
        public static string ConvertFromUrlSafeBase64(string urlSafeBase64String)
        {
            string base64String = urlSafeBase64String.Replace('-', '+').Replace('_', '/');

            // Add padding if necessary
            switch (base64String.Length % 4)
            {
                case 2: base64String += "=="; break;
                case 3: base64String += "="; break;
            }

            return base64String;
        }
    }
}



//using System;
//using System.IO;
//using System.Security.Cryptography;
//using System.Text;
//using Microsoft.Extensions.Configuration;

//namespace HRMSWebAPI.Helper
//{
//    public static class EncryptionStaticHelper
//    {
//        private static readonly string _encryptionKey;
//        private static readonly byte[] _salt;

//        // Static constructor to read the encryption key from appsettings.json
//        static EncryptionStaticHelper()
//        {
//            var configuration = new ConfigurationBuilder()
//                .SetBasePath(Directory.GetCurrentDirectory()) // Set the base path to the current directory
//                .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
//                .Build();

//            _encryptionKey = configuration["EncryptionSettings:EncryptionKey"];
//            _salt = Encoding.ASCII.GetBytes(_encryptionKey.Length.ToString()); // Use a strong salt
//        }

//        // Static method to encrypt the plain text using AES
//        public static string Encrypt(string plainText)
//        {
//            using (Aes aes = Aes.Create())
//            {
//                var keyDerivation = new Rfc2898DeriveBytes(_encryptionKey, _salt, 10000); // 10000 iterations for PBKDF2
//                aes.Key = keyDerivation.GetBytes(32); // 256-bit key
//                aes.IV = keyDerivation.GetBytes(16); // 128-bit IV

//                using (var encryptor = aes.CreateEncryptor(aes.Key, aes.IV))
//                using (var memoryStream = new MemoryStream())
//                {
//                    using (var cryptoStream = new CryptoStream(memoryStream, encryptor, CryptoStreamMode.Write))
//                    {
//                        byte[] plainBytes = Encoding.UTF8.GetBytes(plainText);
//                        cryptoStream.Write(plainBytes, 0, plainBytes.Length);
//                        cryptoStream.FlushFinalBlock();

//                        return Convert.ToBase64String(memoryStream.ToArray());
//                    }
//                }
//            }
//        }

//        // Static method to decrypt the encrypted text using AES
//        //public static string Decrypt(string cipherText)
//        //{
//        //    using (Aes aes = Aes.Create())
//        //    {
//        //        var keyDerivation = new Rfc2898DeriveBytes(_encryptionKey, _salt, 10000);
//        //        aes.Key = keyDerivation.GetBytes(32); // 256-bit key
//        //        aes.IV = keyDerivation.GetBytes(16); // 128-bit IV

//        //        using (var decryptor = aes.CreateDecryptor(aes.Key, aes.IV))
//        //        using (var memoryStream = new MemoryStream(Convert.FromBase64String(cipherText)))
//        //        using (var cryptoStream = new CryptoStream(memoryStream, decryptor, CryptoStreamMode.Read))
//        //        {
//        //            byte[] decryptedBytes = new byte[cipherText.Length];
//        //            int decryptedCount = cryptoStream.Read(decryptedBytes, 0, decryptedBytes.Length);
//        //            return Encoding.UTF8.GetString(decryptedBytes, 0, decryptedCount);
//        //        }
//        //    }
//        //}

//        // Static method to decrypt the encrypted text using AES
//        public static string Decrypt(string cipherText)
//        {
//            try
//            {
//                using (Aes aes = Aes.Create())
//                {
//                    var keyDerivation = new Rfc2898DeriveBytes(_encryptionKey, _salt, 10000);
//                    aes.Key = keyDerivation.GetBytes(32); // 256-bit key
//                    aes.IV = keyDerivation.GetBytes(16); // 128-bit IV

//                    using (var decryptor = aes.CreateDecryptor(aes.Key, aes.IV))
//                    using (var memoryStream = new MemoryStream(Convert.FromBase64String(cipherText)))
//                    using (var cryptoStream = new CryptoStream(memoryStream, decryptor, CryptoStreamMode.Read))
//                    {
//                        byte[] decryptedBytes = new byte[cipherText.Length];
//                        int decryptedCount = cryptoStream.Read(decryptedBytes, 0, decryptedBytes.Length);
//                        return Encoding.UTF8.GetString(decryptedBytes, 0, decryptedCount);
//                    }
//                }
//            }
//            catch (CryptographicException ex)
//            {
//                // Log the error if necessary
//                return null; // Return null if decryption fails due to tampering or padding issues
//            }
//        }


//        public static bool IsBase64String(string base64String)
//            {
//                if (string.IsNullOrEmpty(base64String))
//                    return false;

//                // Trim any white spaces
//                base64String = base64String.Trim();

//                Span<byte> buffer = new Span<byte>(new byte[base64String.Length]);
//                return Convert.TryFromBase64String(base64String, buffer, out _);
//            }


//    }
//}

