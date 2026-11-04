using System.ComponentModel.DataAnnotations;
using System.Text.RegularExpressions;

public class Annotation { }

/**
 * 6 characters long (only digits)
 */
public class OTPAnnotation : RegularExpressionAttribute
{
    public OTPAnnotation()
       : base(@"^\d{6}$") // Regex pattern for exactly 6 digits
    {
    }

    public override string FormatErrorMessage(string name)
    {
        return $"{name} must be exactly 6 digits.";
    }
}


public class EmailAnnotation : RegularExpressionAttribute
{
    public EmailAnnotation()
   : base(@"^[\w!#$%&'*+\-/=?^_`{|}~]+(\.[\w!#$%&'*+\-/=?^_`{|}~]+)*@((([\-\w]+\.)+[a-zA-Z]{2,4})|(([0-9]{1,3}\.){3}[0-9]{1,3}))$")
    {
    }

    // Override FormatErrorMessage to return a custom error message
    public override string FormatErrorMessage(string name)
    {
        return "Email Id is not in valid format.";
    }
}


/**
 * 10 characters long (only digits)
 */
public class MobileAnnotation : RegularExpressionAttribute
{
    public MobileAnnotation()
       : base(@"^(?!0)([6789]\d{9})$") // Regex for exactly 10 digits starting with 6, 7, 8, or 9
    {
    }

    public override string FormatErrorMessage(string name)
    {
        return "Invalid Mobile number.";
    }
}


//public class PasswordAnnotation : ValidationAttribute
//{
//    // Regex pattern to match the password requirements
//    private const string PasswordPattern = @"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$";

//    public override bool IsValid(object value)
//    {
//        // Check if value is null or empty
//        if (value == null || string.IsNullOrWhiteSpace(value.ToString()))
//        {
//            return false; // Or return true if you want to allow null/empty passwords
//        }

//        // Validate against the password pattern
//        return Regex.IsMatch(value.ToString(), PasswordPattern);
//    }

//    public override string FormatErrorMessage(string name)
//    {
//        return $"{name} must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one digit, and one special character.";
//    }
//}

public class PasswordAnnotation : ValidationAttribute
{
    // Regex pattern to match the password requirements
    private const string PasswordPattern = @"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,25}$";

    // List of allowed special characters
    private const string AllowedSpecialCharacters = "@$!%*?&#";

    public override bool IsValid(object value)
    {
        // Check if value is null or empty
        if (value == null || string.IsNullOrWhiteSpace(value.ToString()))
        {
            return false; // Or return true if  want to allow null/empty passwords
        }

        // Validate against the password pattern
        return Regex.IsMatch(value.ToString(), PasswordPattern);
    }

    public override string FormatErrorMessage(string name)
    {
        // Include allowed special characters in the error message
        return $"{name} must be must be between 8 and 25 characters long, contain at least one uppercase letter, one lowercase letter, one digit, and one special character from the following: {AllowedSpecialCharacters}.";
    }
}


/**
 * 12 characters long (only digits)
 */
public class AadhaarAnnotation : RegularExpressionAttribute
{ 
    public AadhaarAnnotation()
       : base(@"^\d{12}$") // Regex pattern for exactly 12 digits
    {
    }

    public override string FormatErrorMessage(string name)
    {
        return $"{name} must be exactly 12 digits.";
    }
}



/**
 * The Permanent Account Number (PAN) in India follows a specific format:
It consists of 10 characters.
The first 5 characters are always uppercase letters.
The next 4 characters are digits.
The last character is an uppercase letter.
ABCDE1234F
 * 
 */
public class PANAnnotation : RegularExpressionAttribute
{
    public PANAnnotation()
        : base(@"^[A-Z]{5}[0-9]{4}[A-Z]{1}$") // Regex for PAN format
    {
    }

    public override string FormatErrorMessage(string name)
    {
        return $"{name} is not a valid PAN number. It should be 10 characters long, with the format: 5 letters, 4 digits, and 1 letter.";
    }
}



/*
 * 15 characters long
The first two characters are digits (representing the state code).
The next 10 characters are the PAN number (which includes both digits and letters).
The 13th character is an alphanumeric digit (typically 1-9 or A-Z).
The 14th character is "Z" by default.
The 15th character is a check digit, which can be either a letter or a number.
 22ABCDE1234F1Z5
 * */

public class GSTNoAnnotation : RegularExpressionAttribute
{
    public GSTNoAnnotation()
        : base(@"^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$") // Regex for GST format
    {
    }

    public override string FormatErrorMessage(string name)
    {
        return $"{name} is not a valid GST number. It should be 15 characters long and follow the correct format.";
    }
}




public class PincodeAnnotation : RegularExpressionAttribute
{
    public PincodeAnnotation()
        : base(@"^\d{6}$") // Regex for exactly 6 digits
    {
    }

    public override string FormatErrorMessage(string name)
    {
        return "Invalid Pincode. Pincode must be exactly 6 digits.";
    }
}



public class InvoiceValueLengthAnnotation : ValidationAttribute
{
    public override bool IsValid(object value)
    {
        // Check if the value is a decimal and greater than 0
        if (value is decimal invoiceValue && invoiceValue > 0)
        {
            // Get the string representation of the decimal, formatted appropriately
            var valueString = invoiceValue.ToString("0.##"); // Formats as decimal without trailing zeros

            // Check if the length of the string representation is greater than 12
            return valueString.Length <= 12;
        }

        return false; // Return false if the value is not valid
    }

    public override string FormatErrorMessage(string name)
    {
        return "Invoice value must be greater than 0 and not exceed 12 characters in length.";
    }
}



public class WeightLengthAnnotation : ValidationAttribute
{
    public override bool IsValid(object value)
    {
        // Check if the value is a decimal and greater than 0
        if (value is decimal weightValue && weightValue > 0)
        {
            // Convert to string representation
            var valueString = weightValue.ToString("0.###"); // Formats as decimal without trailing zeros

            // Check if the total number of digits is valid (before and after the decimal point)
            var parts = valueString.Split('.');
            int integerPartLength = parts[0].Length; // Length of the integer part
            int decimalPartLength = parts.Length > 1 ? parts[1].Length : 0; // Length of the decimal part

            // Validate that total digits do not exceed the limit (9 before decimal + 3 after decimal)
            return integerPartLength <= 9 && decimalPartLength <= 3;
        }

        return false; // Return false if the value is not valid
    }

    public override string FormatErrorMessage(string name)
    {
        return "Weight must be greater than 0 and must not exceed 999,999,999.999.";
    }
}



/**
 * 12 characters long (only digits)
 */
public class EwayBillNoAnnotation : RegularExpressionAttribute
{
    public EwayBillNoAnnotation()
       : base(@"^\d{12}$") // Regex pattern for exactly 12 digits
    {
    }

    public override string FormatErrorMessage(string name)
    {
        return $"{name} must be exactly 12 digits.";
    }
}



[AttributeUsage(AttributeTargets.Property | AttributeTargets.Field, AllowMultiple = false)]

public class PincodeValidationAttribute : ValidationAttribute
{
    public PincodeValidationAttribute()
    {
        ErrorMessage = "Pincode must start with 6 numeric digits.";
    }

    protected override ValidationResult IsValid(object value, ValidationContext validationContext)
    {
        if (value is string pincode)
        {
            // Check if the string starts with exactly 6 digits
            string pattern = @"^\d{6}";
            if (!Regex.IsMatch(pincode, pattern))
            {
                return new ValidationResult("Pincode must start with 6 numeric digits.");
            }

            // Validation passed
            return ValidationResult.Success!;
        }

        // If value is null or not a string
        return new ValidationResult("Invalid pincode format.");
    }
}
