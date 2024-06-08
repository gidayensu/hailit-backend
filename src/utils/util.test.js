import { allowedPropertiesOnly } from './util.js';
import { emailValidator } from './util.js'; 
import { phoneValidator } from './util.js';

//ALLOWED PROPERTIES ONLY TEST
describe('allowedPropertiesOnly', () => {
  test('should return an object with only the allowed properties', () => {
    const data = { a: 1, b: 2, c: 3 };
    const allowedProperties = ['a', 'c'];
    const result = allowedPropertiesOnly(data, allowedProperties);
    expect(result).toEqual({ a: 1, c: 3 });
  });

  test('should return an empty object if no properties are allowed', () => {
    const data = { a: 1, b: 2, c: 3 };
    const allowedProperties = [];
    const result = allowedPropertiesOnly(data, allowedProperties);
    expect(result).toEqual({});
  });

  test('should return an empty object if data is empty', () => {
    const data = {};
    const allowedProperties = ['a', 'b'];
    const result = allowedPropertiesOnly(data, allowedProperties);
    expect(result).toEqual({});
  });

  test('should ignore properties not in the allowed list', () => {
    const data = { a: 1, b: 2, c: 3 };
    const allowedProperties = ['d', 'e'];
    const result = allowedPropertiesOnly(data, allowedProperties);
    expect(result).toEqual({});
  });

  test('should work with nested objects', () => {
    const data = { a: 1, b: { c: 3, d: 4 }, e: 5 };
    const allowedProperties = ['a', 'b'];
    const result = allowedPropertiesOnly(data, allowedProperties);
    expect(result).toEqual({ a: 1, b: { c: 3, d: 4 } });
  });

  test('should work with array properties', () => {
    const data = { a: [1, 2, 3], b: 2, c: 3 };
    const allowedProperties = ['a'];
    const result = allowedPropertiesOnly(data, allowedProperties);
    expect(result).toEqual({ a: [1, 2, 3] });
  });

  test('should return an empty object if allowedProperties is not provided', () => {
    const data = { a: 1, b: 2, c: 3 };
    const result = allowedPropertiesOnly(data);
    expect(result).toEqual({});
  });

  test('should return the original object if all properties are allowed', () => {
    const data = { a: 1, b: 2, c: 3 };
    const allowedProperties = ['a', 'b', 'c'];
    const result = allowedPropertiesOnly(data, allowedProperties);
    expect(result).toEqual({ a: 1, b: 2, c: 3 });
  });
});

//EMAIL VALIDATOR TESTS
describe('emailValidator', ()=> {
    test('test should return true for a valid email', ()=> {
        const validEmails = [
            'test@example.com',
            'user.name@domain.co',
            'user+name@domain.co.in',
            'user-name@domain.com',
            'user@sub.domain.com'
          ];
          validEmails.forEach(email=>{
            expect(emailValidator(email)).toEqual(true);
          })
    })

    test('should return false for invalid email', ()=> {
        const invalidEmails = [
            'plainaddress',
            '@missingusername.com',
            'username@.missingdomain',
            'username@domain..com',
            'username@domain.c',
            'username@domain,com',
            'username@domain@domain.com',
            'username@domain..com',
            
            
          ];

          invalidEmails.forEach(email=>{
            expect(emailValidator(email)).toBe(false)
        })
    })
})

//PHONE VALIDATOR TEST
describe('phoneValidator(GH)',()=> {
    test('should  return false', ()=> {
        const invalidNumbers = [
            "+12335467890",
            "+23398765432",
            "+233212345",  
            "+2335467890123",
            "+233abc12345",   
            "+15551234567",  
            
            "+23370123452",   
            "+23370987654",  
        ]

        invalidNumbers.forEach(number=> {
            expect(phoneValidator(number)).toBe(false)
        })
    })
    test('should return true ', ()=> {
        const validGhanaNumbers = [
            "+233276543214",   
            "+233546789012",   
            "0200000000",     
            "+233238765434",   
            "+233(50)9847654", 
            "+233(55)4567890", 
            "+233240123456",  
            "0595123456"
          ];

          validGhanaNumbers.forEach(number=> {
            expect(phoneValidator(number)).toBe(true)
          })
          

          
    })
})