import "@k2oss/k2-broker-core";

// Service metadata
metadata = {
    systemName: "K2AH.JSSP.awss3",
    displayName: "AWS S3 Service",
    description: "JavaScript Service Provider for AWS S3 integration with bucket and object operations.",
    configuration: {
        AWSAccessKey: {
            displayName: "AWS Access Key",
            type: "string",
            required: true
        },
        AWSSecretKey: {
            displayName: "AWS Secret Key",
            type: "string",
            required: true
        },
        AWSRegion: {
            displayName: "AWS Region",
            type: "string",
            required: true,
            value: "us-east-1"
        },
        ConnectionTimeout: {
            displayName: "Connection Timeout (seconds)",
            type: "number",
            required: false,
            value: 30
        }
    }
};
ondescribe = async function ({ configuration }): Promise<void> {
    postSchema({
        objects: {
            S3Bucket: {
                displayName: "AWS S3 Bucket",
                description: "Operations on AWS S3 buckets",
                properties: {
                    BucketName: {
                        displayName: "Bucket Name",
                        type: "string",
                        description: "Name of the S3 bucket"
                    },
                    CreationDate: {
                        displayName: "Creation Date",
                        type: "dateTime",
                        description: "Date when the bucket was created"
                    },
                    Region: {
                        displayName: "Region",
                        type: "string",
                        description: "AWS region for the bucket"
                    },
                    Status: {
                        displayName: "Status",
                        type: "string",
                        description: "Operation status"
                    }
                },
                methods: {
                    ListBuckets: {
                        displayName: "List Buckets",
                        type: "list",
                        description: "Lists all AWS S3 buckets",
                        outputs: ["BucketName", "CreationDate", "Region"]
                    },
                    GetBucket: {
                        displayName: "Get Bucket",
                        type: "read",
                        description: "Retrieves details for a specific bucket",
                        inputs: ["BucketName"],
                        outputs: ["BucketName", "CreationDate", "Region"]
                    },
                    CreateBucket: {
                        displayName: "Create Bucket",
                        type: "create",
                        description: "Creates a new S3 bucket in the configured region",
                        inputs: ["BucketName"],
                        outputs: ["BucketName", "Status", "Region"]
                    },
                    DeleteBucket: {
                        displayName: "Delete Bucket",
                        type: "delete",
                        description: "Deletes an S3 bucket",
                        inputs: ["BucketName"],
                        outputs: ["BucketName", "Status"]
                    }
                }
            },
            S3Object: {
                displayName: "AWS S3 Object",
                description: "Operations on AWS S3 objects",
                properties: {
                    BucketName: {
                        displayName: "Bucket Name",
                        type: "string",
                        description: "The bucket where the object is stored"
                    },
                    Key: {
                        displayName: "Object Key",
                        type: "string",
                        description: "The key (path) of the object"
                    },
                    FileContent: {
                        displayName: "File Content",
                        type: "extendedString",
                        extendedType: "k2.com/2019/memo",
                        description: "File content as text or base64"
                    },
                    FileName: {
                        displayName: "File Name",
                        type: "string",
                        description: "Name of the file"
                    },
                    ContentType: {
                        displayName: "Content Type",
                        type: "string",
                        description: "MIME type of the object"
                    },
                    Size: {
                        displayName: "Size",
                        type: "number",
                        description: "Object size in bytes"
                    },
                    LastModified: {
                        displayName: "Last Modified",
                        type: "dateTime",
                        description: "Object last modified date"
                    },
                    ETag: {
                        displayName: "ETag",
                        type: "string",
                        description: "Entity tag for the object"
                    },
                    StorageClass: {
                        displayName: "Storage Class",
                        type: "string",
                        description: "S3 storage class for the object"
                    },
                    Status: {
                        displayName: "Status",
                        type: "string",
                        description: "Operation status"
                    }
                },
                methods: {
                    ListObjects: {
                        displayName: "List Objects",
                        type: "list",
                        description: "Lists objects in a bucket",
                        inputs: ["BucketName"],
                        parameters: {
                            Prefix: {
                                displayName: "Prefix",
                                description: "Prefix filter for listing objects",
                                type: "string"
                            }
                        },
                        outputs: ["Key", "Size", "LastModified", "StorageClass", "ETag"]
                    },
                    GetObject: {
                        displayName: "Get Object",
                        type: "read",
                        description: "Gets metadata for an S3 object",
                        inputs: ["BucketName", "Key"],
                        outputs: ["Key", "Size", "LastModified", "ContentType", "ETag"]
                    },
                    UploadObject: {
                        displayName: "Upload Object",
                        type: "create",
                        description: "Uploads a file or content to AWS S3",
                        inputs: ["BucketName", "Key"],
                        parameters: {
                            FileContent: {
                                displayName: "File Content",
                                description: "Direct content to upload",
                                type: "extendedString",
                                extendedType: "k2.com/2019/memo"
                            },
                            ContentType: {
                                displayName: "Content Type",
                                description: "MIME type of the content",
                                type: "string"
                            },
                            IsBase64: {
                                displayName: "Is Base64",
                                description: "Whether the content is base64 encoded",
                                type: "boolean"
                            }
                            // Removed ContentLength parameter
                        },
                        outputs: ["Key", "ETag", "Size", "Status"]
                    },
                    DownloadObject: {
                        displayName: "Download Object",
                        type: "execute",
                        description: "Downloads an object from S3",
                        inputs: ["BucketName", "Key"],
                        parameters: {
                            ReturnAsBase64: {
                                displayName: "Return as Base64",
                                description: "Return content as base64 encoded (recommended for binary files)",
                                type: "boolean"
                            }
                        },
                        outputs: ["Key", "ContentType", "Size", "FileContent", "FileName", "Status"]
                    },
                    DeleteObject: {
                        displayName: "Delete Object",
                        type: "delete",
                        description: "Deletes an object from S3",
                        inputs: ["BucketName", "Key"],
                        outputs: ["Key", "Status"]
                    }
                }
            }
        }
    });
};

// Base64 utility object
const Base64 = {
    // private property
    _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

    // public method for encoding
    encode: function (input: string): string {
        let output = "";
        let chr1: number, chr2: number, chr3: number, enc1: number, enc2: number, enc3: number, enc4: number;
        let i = 0;

        input = Base64._utf8_encode(input);

        while (i < input.length) {
            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);

            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;

            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }

            output = output +
                this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
                this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);
        }

        return output;
    },

    // public method for decoding
    decode: function (input: string): string {
        let output = "";
        let chr1: number, chr2: number, chr3: number;
        let enc1: number, enc2: number, enc3: number, enc4: number;
        let i = 0;

        // Remove whitespace and padding
        input = input.replace(/[^A-Za-z0-9\+\/]/g, "");

        while (i < input.length) {
            enc1 = this._keyStr.indexOf(input.charAt(i++));
            enc2 = this._keyStr.indexOf(input.charAt(i++));
            enc3 = this._keyStr.indexOf(input.charAt(i++));
            enc4 = this._keyStr.indexOf(input.charAt(i++));

            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;

            output = output + String.fromCharCode(chr1);

            if (enc3 != 64) {
                output = output + String.fromCharCode(chr2);
            }
            if (enc4 != 64) {
                output = output + String.fromCharCode(chr3);
            }
        }

        output = Base64._utf8_decode(output);

        return output;
    },

    // public method for decoding binary data (no UTF-8 decoding)
    decodeBinary: function (input: string): string {
        let output = "";
        let chr1: number, chr2: number, chr3: number;
        let enc1: number, enc2: number, enc3: number, enc4: number;
        let i = 0;

        // Remove all whitespace and newlines
        input = input.replace(/[\s\r\n]/g, '');

        while (i < input.length) {
            enc1 = this._keyStr.indexOf(input.charAt(i++));
            enc2 = this._keyStr.indexOf(input.charAt(i++));
            enc3 = this._keyStr.indexOf(input.charAt(i++));
            enc4 = this._keyStr.indexOf(input.charAt(i++));

            if (enc1 === -1 || enc2 === -1) {
                break;
            }

            chr1 = (enc1 << 2) | (enc2 >> 4);
            output = output + String.fromCharCode(chr1);

            if (enc3 !== -1 && enc3 !== 64) {
                chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                output = output + String.fromCharCode(chr2);
            }

            if (enc4 !== -1 && enc4 !== 64) {
                chr3 = ((enc3 & 3) << 6) | enc4;
                output = output + String.fromCharCode(chr3);
            }
        }

        // Don't do UTF-8 decoding for binary data
        return output;
    },

    // private method for UTF-8 encoding
    _utf8_encode: function (string: string): string {
        string = string.replace(/\r\n/g, "\n");
        let utftext = "";

        for (let n = 0; n < string.length; n++) {
            const c = string.charCodeAt(n);

            if (c < 128) {
                utftext += String.fromCharCode(c);
            }
            else if ((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            }
            else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }
        }

        return utftext;
    },

    // private method for UTF-8 decoding
    _utf8_decode: function (utftext: string): string {
        let string = "";
        let i = 0;
        let c = 0, c2 = 0, c3 = 0;

        while (i < utftext.length) {
            c = utftext.charCodeAt(i);

            if (c < 128) {
                string += String.fromCharCode(c);
                i++;
            }
            else if ((c > 191) && (c < 224)) {
                c2 = utftext.charCodeAt(i + 1);
                string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                i += 2;
            }
            else {
                c2 = utftext.charCodeAt(i + 1);
                c3 = utftext.charCodeAt(i + 2);
                string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                i += 3;
            }
        }

        return string;
    }
};

// Main execution handler
onexecute = async function ({
    objectName,
    methodName,
    parameters,
    properties,
    configuration,
    schema,
}): Promise<void> {
    switch (objectName) {
        case "S3Bucket":
            await onexecuteS3Bucket(methodName, properties, parameters, configuration);
            break;
        case "S3Object":
            await onexecuteS3Object(methodName, properties, parameters, configuration);
            break;
        default:
            throw new Error("The object " + objectName + " is not supported.");
    }
};

// Pure JavaScript SHA-256 implementation
function sha256(ascii: string): string {
    function rightRotate(value: number, amount: number): number {
        return (value >>> amount) | (value << (32 - amount));
    }

    const mathPow = Math.pow;
    const maxWord = mathPow(2, 32);
    const lengthProperty = 'length';
    let i: number, j: number;
    let result = '';

    const words: number[] = [];
    const asciiBitLength = ascii[lengthProperty] * 8;

    let hash: number[] = [];
    const k: number[] = [];
    let primeCounter = 0;

    const isComposite: { [key: number]: boolean } = {};
    for (let candidate = 2; primeCounter < 64; candidate++) {
        if (!isComposite[candidate]) {
            for (i = 0; i < 313; i += candidate) {
                isComposite[i] = true;
            }
            hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0;
            k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
        }
    }

    ascii += '\x80';
    while (ascii[lengthProperty] % 64 - 56) ascii += '\x00';
    for (i = 0; i < ascii[lengthProperty]; i++) {
        j = ascii.charCodeAt(i);
        if (j >> 8) return ''; // ASCII check
        words[i >> 2] |= j << ((3 - i) % 4) * 8;
    }
    words[words[lengthProperty]] = ((asciiBitLength / maxWord) | 0);
    words[words[lengthProperty]] = (asciiBitLength);

    for (j = 0; j < words[lengthProperty];) {
        const w: number[] = words.slice(j, j += 16);
        const oldHash = hash.slice(0);

        for (i = 0; i < 64; i++) {
            const w15 = w[i - 15], w2 = w[i - 2];
            const a = hash[0], e = hash[4];
            const temp1 = hash[7]
                + (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25))
                + ((e & hash[5]) ^ ((~e) & hash[6]))
                + k[i]
                + (w[i] = (i < 16) ? w[i] : (
                    w[i - 16]
                    + (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3))
                    + w[i - 7]
                    + (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))
                ) | 0);

            const temp2 = (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22))
                + ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));

            hash = [(temp1 + temp2) | 0].concat(hash);
            hash[4] = (hash[4] + temp1) | 0;
        }

        for (i = 0; i < 8; i++) {
            hash[i] = (hash[i] + oldHash[i]) | 0;
        }
    }

    for (i = 0; i < 8; i++) {
        for (j = 3; j + 1; j--) {
            const b = (hash[i] >> (j * 8)) & 255;
            result += ((b < 16) ? 0 : '') + b.toString(16);
        }
    }
    return result;
}

// Convert binary string to Uint8Array
function binaryStringToUint8Array(binaryStr: string): Uint8Array {
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
        bytes[i] = binaryStr.charCodeAt(i) & 0xFF;
    }
    return bytes;
}

// SHA-256 for Uint8Array (binary data)
function sha256Uint8Array(data: Uint8Array): string {
    function rightRotate(value: number, amount: number): number {
        return (value >>> amount) | (value << (32 - amount));
    }

    const mathPow = Math.pow;
    const maxWord = mathPow(2, 32);
    let i: number, j: number;
    let result = '';

    const words: number[] = [];
    const bitLength = data.length * 8;

    let hash: number[] = [];
    const k: number[] = [];
    let primeCounter = 0;

    const isComposite: { [key: number]: boolean } = {};
    for (let candidate = 2; primeCounter < 64; candidate++) {
        if (!isComposite[candidate]) {
            for (i = 0; i < 313; i += candidate) {
                isComposite[i] = true;
            }
            hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0;
            k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
        }
    }

    // Padding
    const paddedLength = ((data.length + 9 + 63) & ~63);
    const padded = new Uint8Array(paddedLength);
    padded.set(data);
    padded[data.length] = 0x80;

    // Add length in bits as big-endian 64-bit integer
    const lengthHigh = (bitLength / maxWord) | 0;
    const lengthLow = bitLength >>> 0;

    padded[paddedLength - 8] = (lengthHigh >>> 24) & 0xFF;
    padded[paddedLength - 7] = (lengthHigh >>> 16) & 0xFF;
    padded[paddedLength - 6] = (lengthHigh >>> 8) & 0xFF;
    padded[paddedLength - 5] = lengthHigh & 0xFF;
    padded[paddedLength - 4] = (lengthLow >>> 24) & 0xFF;
    padded[paddedLength - 3] = (lengthLow >>> 16) & 0xFF;
    padded[paddedLength - 2] = (lengthLow >>> 8) & 0xFF;
    padded[paddedLength - 1] = lengthLow & 0xFF;

    // Convert to words
    for (i = 0; i < paddedLength; i += 4) {
        words[i >> 2] = (padded[i] << 24) | (padded[i + 1] << 16) | (padded[i + 2] << 8) | padded[i + 3];
    }

    // Process blocks
    for (j = 0; j < words.length; j += 16) {
        const w: number[] = words.slice(j, j + 16);
        const oldHash = hash.slice(0);

        for (i = 0; i < 64; i++) {
            if (i >= 16) {
                const w15 = w[i - 15], w2 = w[i - 2];
                w[i] = (w[i - 16]
                    + (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3))
                    + w[i - 7]
                    + (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))) | 0;
            }

            const a = hash[0], e = hash[4];
            const temp1 = hash[7]
                + (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25))
                + ((e & hash[5]) ^ ((~e) & hash[6]))
                + k[i]
                + w[i];

            const temp2 = (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22))
                + ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));

            hash = [(temp1 + temp2) | 0].concat(hash);
            hash[4] = (hash[4] + temp1) | 0;
        }

        for (i = 0; i < 8; i++) {
            hash[i] = (hash[i] + oldHash[i]) | 0;
        }
    }

    for (i = 0; i < 8; i++) {
        for (j = 3; j + 1; j--) {
            const b = (hash[i] >> (j * 8)) & 255;
            result += ((b < 16) ? 0 : '') + b.toString(16);
        }
    }
    return result;
}

// SHA-256 for binary content (handles binary data properly)
function sha256Binary(binaryData: string): string {
    // Convert binary string to Uint8Array and calculate hash
    const bytes = binaryStringToUint8Array(binaryData);
    return sha256Uint8Array(bytes);
}

// SHA-256 for UTF-8 content
function sha256UTF8(message: string): string {
    // Convert string to UTF-8 bytes
    const bytes: number[] = [];
    for (let i = 0; i < message.length; i++) {
        const c = message.charCodeAt(i);
        if (c < 0x80) {
            bytes.push(c);
        } else if (c < 0x800) {
            bytes.push(0xc0 | (c >> 6));
            bytes.push(0x80 | (c & 0x3f));
        } else if (c < 0xd800 || c >= 0xe000) {
            bytes.push(0xe0 | (c >> 12));
            bytes.push(0x80 | ((c >> 6) & 0x3f));
            bytes.push(0x80 | (c & 0x3f));
        } else {
            // Surrogate pair
            i++;
            const c2 = message.charCodeAt(i);
            const codePoint = 0x10000 + ((c & 0x3ff) << 10) + (c2 & 0x3ff);
            bytes.push(0xf0 | (codePoint >> 18));
            bytes.push(0x80 | ((codePoint >> 12) & 0x3f));
            bytes.push(0x80 | ((codePoint >> 6) & 0x3f));
            bytes.push(0x80 | (codePoint & 0x3f));
        }
    }

    // Convert bytes back to string for sha256 function
    let binaryString = '';
    for (let i = 0; i < bytes.length; i++) {
        binaryString += String.fromCharCode(bytes[i]);
    }

    return sha256(binaryString);
}

// HMAC-SHA256 implementation
function hmacSHA256(key: string, message: string): string {
    const blockSize = 64;
    let computedKey = key;

    if (key.length > blockSize) {
        computedKey = sha256(key);
        // Convert hex to string
        let temp = '';
        for (let i = 0; i < computedKey.length; i += 2) {
            temp += String.fromCharCode(parseInt(computedKey.substr(i, 2), 16));
        }
        computedKey = temp;
    }

    while (computedKey.length < blockSize) {
        computedKey += '\x00';
    }

    let oKeyPad = '';
    let iKeyPad = '';
    for (let i = 0; i < blockSize; i++) {
        const byte = computedKey.charCodeAt(i);
        oKeyPad += String.fromCharCode(byte ^ 0x5c);
        iKeyPad += String.fromCharCode(byte ^ 0x36);
    }

    const innerHash = sha256(iKeyPad + message);
    // Convert hex to string for outer hash
    let innerHashStr = '';
    for (let i = 0; i < innerHash.length; i += 2) {
        innerHashStr += String.fromCharCode(parseInt(innerHash.substr(i, 2), 16));
    }

    return sha256(oKeyPad + innerHashStr);
}

// HMAC-SHA256 implementation with binary key support
function hmacSHA256Binary(key: string, message: string, keyIsBinary: boolean = false): string {
    const blockSize = 64;
    let computedKey = key;

    if (key.length > blockSize) {
        if (keyIsBinary) {
            computedKey = sha256Binary(key);
        } else {
            computedKey = sha256(key);
        }
        // Convert hex to string
        let temp = '';
        for (let i = 0; i < computedKey.length; i += 2) {
            temp += String.fromCharCode(parseInt(computedKey.substr(i, 2), 16));
        }
        computedKey = temp;
    }

    while (computedKey.length < blockSize) {
        computedKey += '\x00';
    }

    let oKeyPad = '';
    let iKeyPad = '';
    for (let i = 0; i < blockSize; i++) {
        const byte = computedKey.charCodeAt(i) & 0xFF;
        oKeyPad += String.fromCharCode(byte ^ 0x5c);
        iKeyPad += String.fromCharCode(byte ^ 0x36);
    }

    const innerHash = sha256(iKeyPad + message);
    // Convert hex to string for outer hash
    let innerHashStr = '';
    for (let i = 0; i < innerHash.length; i += 2) {
        innerHashStr += String.fromCharCode(parseInt(innerHash.substr(i, 2), 16));
    }

    return sha256(oKeyPad + innerHashStr);
}

// Convert string to hex
function toHex(str: string): string {
    let hex = '';
    for (let i = 0; i < str.length; i++) {
        const code = str.charCodeAt(i);
        hex += ('0' + code.toString(16)).slice(-2);
    }
    return hex;
}

// Convert hex string to binary string
function hexToString(hex: string): string {
    let str = '';
    for (let i = 0; i < hex.length; i += 2) {
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    }
    return str;
}

// Alternative base64 decoder for comparison
function alternativeBase64Decode(input: string): string {
    // Remove whitespace
    input = input.replace(/[\s\r\n]/g, '');

    // Standard base64 alphabet
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

    let output = '';
    let buffer = 0;
    let bits = 0;

    for (let i = 0; i < input.length; i++) {
        const char = input[i];
        if (char === '=') break;

        const value = chars.indexOf(char);
        if (value === -1) {
            console.warn(`Invalid base64 character at position ${i}: ${char}`);
            continue;
        }

        buffer = (buffer << 6) | value;
        bits += 6;

        if (bits >= 8) {
            bits -= 8;
            output += String.fromCharCode((buffer >> bits) & 0xFF);
        }
    }

    return output;
}

// AWS Signature V4 implementation
function createAWSSignatureV4(
    config: SingleRecord,
    method: string,
    path: string,
    queryString: string,
    headers: any,
    payload: string,
    region: string,
    service: string
): any {
    const accessKey = config.AWSAccessKey as string;
    const secretKey = config.AWSSecretKey as string;
    const awsRegion = region || (config.AWSRegion as string);

    // Create timestamp
    const now = new Date();
    const dateStamp = now.toISOString().split('T')[0].replace(/-/g, '');
    const amzDate = now.toISOString().replace(/[:\-]|\.\d{3}/g, '');

    // Calculate payload hash
    const payloadHash = sha256(payload || '');

    // Create canonical headers
    const hostHeader = headers['Host'] || `s3.${awsRegion}.amazonaws.com`;
    const canonicalHeaders: any = {
        'host': hostHeader,
        'x-amz-content-sha256': payloadHash,
        'x-amz-date': amzDate
    };

    // Add additional headers if present
    if (headers['Content-Type']) {
        canonicalHeaders['content-type'] = headers['Content-Type'];
    }
    if (headers['Content-Length']) {
        canonicalHeaders['content-length'] = headers['Content-Length'];
    }

    // Sort headers
    const sortedHeaders = Object.keys(canonicalHeaders).sort();
    const signedHeaders = sortedHeaders.join(';');

    // Create canonical request
    let canonicalRequest = method + '\n';
    canonicalRequest += path + '\n';
    canonicalRequest += (queryString || '') + '\n';

    // Add headers to canonical request
    for (const header of sortedHeaders) {
        canonicalRequest += header + ':' + canonicalHeaders[header] + '\n';
    }

    canonicalRequest += '\n';
    canonicalRequest += signedHeaders + '\n';
    canonicalRequest += payloadHash;

    // Create string to sign
    const algorithm = 'AWS4-HMAC-SHA256';
    const credentialScope = `${dateStamp}/${awsRegion}/${service}/aws4_request`;
    const canonicalRequestHash = sha256(canonicalRequest);

    const stringToSign = algorithm + '\n' +
        amzDate + '\n' +
        credentialScope + '\n' +
        canonicalRequestHash;

    // Calculate signature
    const kDate = hmacSHA256('AWS4' + secretKey, dateStamp);
    const kRegion = hmacSHA256(hexToString(kDate), awsRegion);
    const kService = hmacSHA256(hexToString(kRegion), service);
    const kSigning = hmacSHA256(hexToString(kService), 'aws4_request');
    const signature = hmacSHA256(hexToString(kSigning), stringToSign);

    // Create authorization header
    const authorizationHeader = `${algorithm} ` +
        `Credential=${accessKey}/${credentialScope}, ` +
        `SignedHeaders=${signedHeaders}, ` +
        `Signature=${signature}`;

    const resultHeaders: any = {
        'Authorization': authorizationHeader,
        'X-Amz-Date': amzDate,
        'X-Amz-Content-Sha256': payloadHash,
        'Host': hostHeader
    };

    // Add Content-Type and Content-Length if they were provided
    if (headers['Content-Type']) {
        resultHeaders['Content-Type'] = headers['Content-Type'];
    }
    if (headers['Content-Length']) {
        resultHeaders['Content-Length'] = headers['Content-Length'];
    }

    return resultHeaders;
}

// Special version for file uploads
function createAWSSignatureV4ForUpload(
    config: SingleRecord,
    method: string,
    path: string,
    queryString: string,
    headers: any,
    payload: string,
    region: string,
    service: string,
    isBinaryPayload: boolean = false
): any {
    const accessKey = config.AWSAccessKey as string;
    const secretKey = config.AWSSecretKey as string;
    const awsRegion = region || (config.AWSRegion as string);

    // Create timestamp
    const now = new Date();
    const dateStamp = now.toISOString().split('T')[0].replace(/-/g, '');
    const amzDate = now.toISOString().replace(/[:\-]|\.\d{3}/g, '');

    // Calculate payload hash - handle binary vs text content
    let payloadHash: string;
    if (isBinaryPayload) {
        // For binary content (like decoded base64), use binary-safe SHA256
        payloadHash = sha256Binary(payload || '');
        console.log("Binary payload hash:", payloadHash);
        if (!payloadHash) {
            console.error("Binary SHA256 returned empty hash!");
        }
    } else {
        // For text content, use UTF-8 aware version
        payloadHash = sha256UTF8(payload || '');
        console.log("Text payload hash:", payloadHash);
    }

    // Create canonical headers
    const hostHeader = headers['Host'] || `s3.${awsRegion}.amazonaws.com`;
    const canonicalHeaders: any = {
        'host': hostHeader,
        'x-amz-content-sha256': payloadHash,
        'x-amz-date': amzDate
    };

    // Add additional headers if present
    if (headers['Content-Type']) {
        canonicalHeaders['content-type'] = headers['Content-Type'];
    }
    if (headers['Content-Length']) {
        canonicalHeaders['content-length'] = headers['Content-Length'];
    }

    // Sort headers
    const sortedHeaders = Object.keys(canonicalHeaders).sort();
    const signedHeaders = sortedHeaders.join(';');

    // Create canonical request
    let canonicalRequest = method + '\n';
    canonicalRequest += path + '\n';
    canonicalRequest += (queryString || '') + '\n';

    // Add headers to canonical request
    for (const header of sortedHeaders) {
        canonicalRequest += header + ':' + canonicalHeaders[header] + '\n';
    }

    canonicalRequest += '\n';
    canonicalRequest += signedHeaders + '\n';
    canonicalRequest += payloadHash;

    // Create string to sign
    const algorithm = 'AWS4-HMAC-SHA256';
    const credentialScope = `${dateStamp}/${awsRegion}/${service}/aws4_request`;
    const canonicalRequestHash = sha256(canonicalRequest);

    const stringToSign = algorithm + '\n' +
        amzDate + '\n' +
        credentialScope + '\n' +
        canonicalRequestHash;

    // Calculate signature
    const kDate = hmacSHA256('AWS4' + secretKey, dateStamp);
    const kRegion = hmacSHA256(hexToString(kDate), awsRegion);
    const kService = hmacSHA256(hexToString(kRegion), service);
    const kSigning = hmacSHA256(hexToString(kService), 'aws4_request');
    const signature = hmacSHA256(hexToString(kSigning), stringToSign);

    // Create authorization header
    const authorizationHeader = `${algorithm} ` +
        `Credential=${accessKey}/${credentialScope}, ` +
        `SignedHeaders=${signedHeaders}, ` +
        `Signature=${signature}`;

    const resultHeaders: any = {
        'Authorization': authorizationHeader,
        'X-Amz-Date': amzDate,
        'X-Amz-Content-Sha256': payloadHash,
        'Host': hostHeader
    };

    // Add Content-Type and Content-Length if they were provided
    if (headers['Content-Type']) {
        resultHeaders['Content-Type'] = headers['Content-Type'];
    }
    if (headers['Content-Length']) {
        resultHeaders['Content-Length'] = headers['Content-Length'];
    }

    return resultHeaders;
}

// Calculate string byte length for binary content
function getBinaryStringByteLength(str: string): number {
    // For binary strings, each character represents exactly one byte
    return str.length;
}

// Calculate string byte length
function getStringByteLength(str: string): number {
    let byteLength = 0;
    for (let i = 0; i < str.length; i++) {
        const code = str.charCodeAt(i);
        if (code <= 0x7F) {
            byteLength += 1;
        } else if (code <= 0x7FF) {
            byteLength += 2;
        } else if (code >= 0xD800 && code <= 0xDFFF) {
            // Surrogate pair
            byteLength += 4;
            i++; // Skip the next character (low surrogate)
        } else if (code <= 0xFFFF) {
            byteLength += 3;
        } else {
            byteLength += 4;
        }
    }
    return byteLength;
}

// Base64 encoding function
function base64Encode(str: string): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    let result = '';
    let i = 0;

    while (i < str.length) {
        const a = str.charCodeAt(i++);
        const b = i < str.length ? str.charCodeAt(i++) : 0;
        const c = i < str.length ? str.charCodeAt(i++) : 0;

        const bitmap = (a << 16) | (b << 8) | c;

        result += chars.charAt((bitmap >> 18) & 63);
        result += chars.charAt((bitmap >> 12) & 63);
        result += i - 2 < str.length ? chars.charAt((bitmap >> 6) & 63) : '=';
        result += i - 1 < str.length ? chars.charAt(bitmap & 63) : '=';
    }

    return result;
}

// Base64 decoding function
function base64Decode(str: string): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    let result = '';
    let i = 0;

    // Remove all non-base64 characters
    str = str.replace(/[^A-Za-z0-9\+\/]/g, '');

    // Process each group of 4 base64 characters
    while (i < str.length) {
        const encoded1 = chars.indexOf(str.charAt(i++));
        const encoded2 = chars.indexOf(str.charAt(i++));
        const encoded3 = i < str.length ? chars.indexOf(str.charAt(i++)) : 64;
        const encoded4 = i < str.length ? chars.indexOf(str.charAt(i++)) : 64;

        const bitmap = (encoded1 << 18) | (encoded2 << 12) | (encoded3 << 6) | encoded4;

        result += String.fromCharCode((bitmap >> 16) & 255);
        if (encoded3 !== 64) result += String.fromCharCode((bitmap >> 8) & 255);
        if (encoded4 !== 64) result += String.fromCharCode(bitmap & 255);
    }

    return result;
}

// Helper function to extract base64 content
function getBase64FromContent(content: string): string {
    if (!content) {
        return "";
    }

    // First, check if content is wrapped in <content> tags
    const match = content.match(/<content>([\s\S]*?)<\/content>/);
    if (match && match[1]) {
        return match[1].trim();
    }

    // If not wrapped, assume the entire content is base64
    return content.trim();
}

// Helper function to find bucket region
async function findBucketRegion(bucketName: string, configuration: SingleRecord): Promise<string> {
    const regions = ['us-east-1', 'us-west-1', 'us-west-2', 'eu-west-1', 'eu-central-1', 'ap-southeast-1', 'ap-northeast-1'];
    const configuredRegion = configuration.AWSRegion as string;

    // Try configured region first
    for (const region of [configuredRegion, ...regions.filter(r => r !== configuredRegion)]) {
        try {
            const host = `${bucketName}.s3.${region}.amazonaws.com`;
            const url = `https://${host}/`;

            const headers = createAWSSignatureV4(
                configuration,
                'HEAD',
                '/',
                '',
                { 'Host': host },
                '',
                region,
                's3'
            );

            await makeAwsRequest('HEAD', url, headers, null, configuration);
            return region; // If successful, this is the correct region
        } catch (error: any) {
            // Continue to next region if this one fails
            continue;
        }
    }

    throw new Error(`Could not find bucket ${bucketName} in any region`);
}

// Helper function to make AWS API calls with authentication
function makeAwsRequest(
    method: string,
    url: string,
    headers: any,
    body?: string | null,
    configuration?: SingleRecord
): Promise<any> {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const timeout = (configuration?.ConnectionTimeout as number) || 30;

        xhr.timeout = timeout * 1000;

        xhr.onreadystatechange = function () {
            try {
                if (xhr.readyState !== 4) return;
                if (xhr.status < 200 || xhr.status >= 300) {
                    throw new Error(`AWS API call failed with status ${xhr.status}: ${xhr.responseText}`);
                }

                // Collect response headers manually
                const responseHeaders: { [key: string]: string } = {};
                const headerKeys = ['content-type', 'content-length', 'etag', 'last-modified'];
                headerKeys.forEach(key => {
                    const value = xhr.getResponseHeader(key);
                    if (value) {
                        responseHeaders[key] = value;
                    }
                });

                resolve({
                    status: xhr.status,
                    data: xhr.responseText,
                    headers: responseHeaders
                });
            } catch (e) {
                reject(e);
            }
        };

        xhr.onerror = function () {
            reject(new Error('Network error occurred'));
        };

        xhr.ontimeout = function () {
            reject(new Error('Request timed out'));
        };

        xhr.open(method, url);

        // Set headers
        if (headers) {
            for (const header in headers) {
                xhr.setRequestHeader(header, headers[header]);
            }
        }

        xhr.send(body || null);
    });
}

// Helper function to parse XML response
function parseXmlResponse(xmlText: string): any {
    // Simple XML parsing for S3 responses
    const result: any = {};

    // Parse bucket list
    const bucketRegex = /<Bucket>[\s\S]*?<\/Bucket>/g;
    const bucketMatches = xmlText.match(bucketRegex);
    if (bucketMatches) {
        result.Buckets = bucketMatches.map(bucketXml => {
            const name = (bucketXml.match(/<Name>(.*?)<\/Name>/) || [])[1];
            const creationDate = (bucketXml.match(/<CreationDate>(.*?)<\/CreationDate>/) || [])[1];
            return {
                Name: name,
                CreationDate: new Date(creationDate)
            };
        });
    }

    // Parse object list
    const objectRegex = /<Contents>[\s\S]*?<\/Contents>/g;
    const objectMatches = xmlText.match(objectRegex);
    if (objectMatches) {
        result.Contents = objectMatches.map(objectXml => {
            const key = (objectXml.match(/<Key>(.*?)<\/Key>/) || [])[1];
            const size = parseInt((objectXml.match(/<Size>(.*?)<\/Size>/) || [])[1] || '0');
            const lastModified = (objectXml.match(/<LastModified>(.*?)<\/LastModified>/) || [])[1];
            const etag = (objectXml.match(/<ETag>(.*?)<\/ETag>/) || [])[1];
            const storageClass = (objectXml.match(/<StorageClass>(.*?)<\/StorageClass>/) || [])[1];

            return {
                Key: key,
                Size: size,
                LastModified: new Date(lastModified),
                ETag: etag ? etag.replace(/"/g, '') : '',
                StorageClass: storageClass || 'STANDARD'
            };
        });
    }

    return result;
}

// S3 Bucket method execution
async function onexecuteS3Bucket(
    methodName: string,
    properties: SingleRecord,
    parameters: SingleRecord,
    configuration: SingleRecord
): Promise<void> {
    switch (methodName) {
        case "ListBuckets":
            await onexecuteListBuckets(configuration);
            break;
        case "GetBucket":
            await onexecuteGetBucket(properties, configuration);
            break;
        case "CreateBucket":
            await onexecuteCreateBucket(properties, parameters, configuration);
            break;
        case "DeleteBucket":
            await onexecuteDeleteBucket(properties, configuration);
            break;
        default:
            throw new Error("The method " + methodName + " is not supported for S3Bucket.");
    }
}

// S3 Object method execution
async function onexecuteS3Object(
    methodName: string,
    properties: SingleRecord,
    parameters: SingleRecord,
    configuration: SingleRecord
): Promise<void> {
    switch (methodName) {
        case "ListObjects":
            await onexecuteListObjects(properties, parameters, configuration);
            break;
        case "GetObject":
            await onexecuteGetObject(properties, configuration);
            break;
        case "UploadObject":
            await onexecuteUploadObject(properties, parameters, configuration);
            break;
        case "DownloadObject":
            await onexecuteDownloadObject(properties, parameters, configuration);
            break;
        case "DeleteObject":
            await onexecuteDeleteObject(properties, configuration);
            break;
        default:
            throw new Error("The method " + methodName + " is not supported for S3Object.");
    }
}

// List all S3 buckets
async function onexecuteListBuckets(configuration: SingleRecord): Promise<void> {
    try {
        const region = configuration.AWSRegion as string;
        const host = `s3.${region}.amazonaws.com`;
        const url = `https://${host}/`;
        const path = '/';

        // Generate AWS signature
        const headers = createAWSSignatureV4(
            configuration,
            'GET',
            path,
            '',
            { 'Host': host },
            '',
            region,
            's3'
        );

        // Make request
        const response = await makeAwsRequest('GET', url, headers, null, configuration);

        // Parse response
        const parsed = parseXmlResponse(response.data);

        if (parsed.Buckets) {
            parsed.Buckets.forEach((bucket: any) => {
                postResult({
                    BucketName: bucket.Name,
                    CreationDate: bucket.CreationDate,
                    Region: region
                });
            });
        }

    } catch (error: any) {
        throw new Error(`ListBuckets failed: ${error.message}`);
    }
}

// Get bucket details
async function onexecuteGetBucket(properties: SingleRecord, configuration: SingleRecord): Promise<void> {
    const bucketName = properties.BucketName as string;
    if (!bucketName) {
        throw new Error("BucketName is required");
    }

    try {
        // For GetBucket, we'll use ListBuckets and filter the result
        // This is because the ?location endpoint requires different permissions
        const region = configuration.AWSRegion as string;
        const host = `s3.${region}.amazonaws.com`;
        const url = `https://${host}/`;
        const path = '/';

        // Generate AWS signature for ListBuckets
        const headers = createAWSSignatureV4(
            configuration,
            'GET',
            path,
            '',
            { 'Host': host },
            '',
            region,
            's3'
        );

        // Make request
        const response = await makeAwsRequest('GET', url, headers, null, configuration);

        // Parse response and find the specific bucket
        const parsed = parseXmlResponse(response.data);

        if (parsed.Buckets) {
            const bucket = parsed.Buckets.find((b: any) => b.Name === bucketName);
            if (bucket) {
                postResult({
                    BucketName: bucket.Name,
                    CreationDate: bucket.CreationDate,
                    Region: region
                });
            } else {
                throw new Error(`Bucket '${bucketName}' not found`);
            }
        } else {
            throw new Error(`No buckets found`);
        }

    } catch (error: any) {
        throw new Error(`GetBucket failed: ${error.message}`);
    }
}

// Create a new S3 bucket
async function onexecuteCreateBucket(
    properties: SingleRecord,
    parameters: SingleRecord,
    configuration: SingleRecord
): Promise<void> {
    const bucketName = properties.BucketName as string;
    const region = configuration.AWSRegion as string; // Always use config region

    if (!bucketName) {
        throw new Error("BucketName is required");
    }

    try {
        const host = `${bucketName}.s3.${region}.amazonaws.com`;
        const url = `https://${host}/`;
        const path = '/';

        let body = '';
        const headers: any = { 'Host': host };

        // For regions other than us-east-1, we need to specify the location constraint
        if (region !== 'us-east-1') {
            body = `<CreateBucketConfiguration><LocationConstraint>${region}</LocationConstraint></CreateBucketConfiguration>`;
            headers['Content-Type'] = 'application/xml';
            headers['Content-Length'] = body.length.toString();
        }

        const signedHeaders = createAWSSignatureV4(
            configuration,
            'PUT',
            path,
            '',
            headers,
            body,
            region,
            's3'
        );

        await makeAwsRequest('PUT', url, signedHeaders, body, configuration);

        postResult({
            BucketName: bucketName,
            Status: 'Success',
            Region: region
        });

    } catch (error: any) {
        throw new Error(`CreateBucket failed: ${error.message}`);
    }
}

// Delete an S3 bucket
async function onexecuteDeleteBucket(properties: SingleRecord, configuration: SingleRecord): Promise<void> {
    const bucketName = properties.BucketName as string;
    if (!bucketName) {
        throw new Error("BucketName is required");
    }

    try {
        const region = configuration.AWSRegion as string;
        const host = `${bucketName}.s3.${region}.amazonaws.com`;
        const url = `https://${host}/`;
        const path = '/';

        const headers = createAWSSignatureV4(
            configuration,
            'DELETE',
            path,
            '',
            { 'Host': host },
            '',
            region,
            's3'
        );

        await makeAwsRequest('DELETE', url, headers, null, configuration);

        postResult({
            BucketName: bucketName,
            Status: 'Success'
        });

    } catch (error: any) {
        throw new Error(`DeleteBucket failed: ${error.message}`);
    }
}

// List objects in a bucket
async function onexecuteListObjects(
    properties: SingleRecord,
    parameters: SingleRecord,
    configuration: SingleRecord
): Promise<void> {
    const bucketName = properties.BucketName as string;
    const prefix = parameters.Prefix as string;

    if (!bucketName) {
        throw new Error("BucketName is required");
    }

    try {
        // First, try to determine the bucket's region by listing all buckets
        const allBucketsRegion = configuration.AWSRegion as string;
        const allBucketsHost = `s3.${allBucketsRegion}.amazonaws.com`;
        const allBucketsUrl = `https://${allBucketsHost}/`;

        const allBucketsHeaders = createAWSSignatureV4(
            configuration,
            'GET',
            '/',
            '',
            { 'Host': allBucketsHost },
            '',
            allBucketsRegion,
            's3'
        );

        let bucketRegion = allBucketsRegion; // Default to configured region

        try {
            const bucketsResponse = await makeAwsRequest('GET', allBucketsUrl, allBucketsHeaders, null, configuration);
            const parsedBuckets = parseXmlResponse(bucketsResponse.data);

            // Check if we can find the bucket in the list
            if (parsedBuckets.Buckets) {
                const foundBucket = parsedBuckets.Buckets.find((b: any) => b.Name === bucketName);
                if (!foundBucket) {
                    console.warn(`Bucket ${bucketName} not found in list, using configured region`);
                }
            }
        } catch (e: any) {
            console.warn('Could not list buckets to determine region:', e.message);
        }

        // Now try to list objects
        const host = `${bucketName}.s3.${bucketRegion}.amazonaws.com`;
        let url = `https://${host}/`;
        let queryString = '';

        if (prefix) {
            queryString = `prefix=${encodeURIComponent(prefix)}`;
            url += '?' + queryString;
        }

        const path = '/';

        const headers = createAWSSignatureV4(
            configuration,
            'GET',
            path,
            queryString,
            { 'Host': host },
            '',
            bucketRegion,
            's3'
        );

        try {
            const response = await makeAwsRequest('GET', url, headers, null, configuration);
            const parsed = parseXmlResponse(response.data);

            if (parsed.Contents) {
                parsed.Contents.forEach((object: any) => {
                    postResult({
                        Key: object.Key,
                        Size: object.Size,
                        LastModified: object.LastModified,
                        StorageClass: object.StorageClass,
                        ETag: object.ETag
                    });
                });
            }
        } catch (error: any) {
            // If we get a 301 redirect, extract the correct endpoint and retry
            if (error.message.includes('PermanentRedirect')) {
                const endpointMatch = error.message.match(/<Endpoint>(.*?)<\/Endpoint>/);
                if (endpointMatch) {
                    const correctEndpoint = endpointMatch[1];
                    const correctUrl = `https://${correctEndpoint}/` + (queryString ? '?' + queryString : '');

                    // Extract region from endpoint (e.g., "k2reply.s3-eu-west-1.amazonaws.com" -> "eu-west-1")
                    const regionMatch = correctEndpoint.match(/s3[.-]([a-z0-9-]+)\.amazonaws\.com/);
                    const correctRegion = regionMatch ? regionMatch[1] : bucketRegion;

                    console.log(`Bucket is in different region. Retrying with endpoint: ${correctEndpoint}`);

                    const retryHeaders = createAWSSignatureV4(
                        configuration,
                        'GET',
                        path,
                        queryString,
                        { 'Host': correctEndpoint },
                        '',
                        correctRegion,
                        's3'
                    );

                    const retryResponse = await makeAwsRequest('GET', correctUrl, retryHeaders, null, configuration);
                    const retryParsed = parseXmlResponse(retryResponse.data);

                    if (retryParsed.Contents) {
                        retryParsed.Contents.forEach((object: any) => {
                            postResult({
                                Key: object.Key,
                                Size: object.Size,
                                LastModified: object.LastModified,
                                StorageClass: object.StorageClass,
                                ETag: object.ETag
                            });
                        });
                    }
                    return;
                }
            }
            throw error;
        }

    } catch (error: any) {
        throw new Error(`ListObjects failed: ${error.message}`);
    }
}

// Get object metadata
async function onexecuteGetObject(properties: SingleRecord, configuration: SingleRecord): Promise<void> {
    const bucketName = properties.BucketName as string;
    const key = properties.Key as string;

    if (!bucketName || !key) {
        throw new Error("BucketName and Key are required");
    }

    try {
        const region = configuration.AWSRegion as string;
        const host = `${bucketName}.s3.${region}.amazonaws.com`;
        const url = `https://${host}/${encodeURIComponent(key)}`;
        const path = `/${key}`;

        const headers = createAWSSignatureV4(
            configuration,
            'HEAD',
            path,
            '',
            { 'Host': host },
            '',
            region,
            's3'
        );

        try {
            const response = await makeAwsRequest('HEAD', url, headers, null, configuration);

            postResult({
                Key: key,
                Size: parseInt(response.headers['content-length'] || '0'),
                LastModified: new Date(response.headers['last-modified'] || new Date()),
                ContentType: response.headers['content-type'] || 'application/octet-stream',
                ETag: (response.headers.etag || '').replace(/"/g, '')
            });
        } catch (error: any) {
            // If we get a 301 redirect, extract the correct endpoint and retry
            if (error.message.includes('301') || error.message.includes('PermanentRedirect')) {
                // For HEAD requests, we might not get the XML response body with the endpoint
                // Try common regions
                const regions = ['us-east-1', 'us-west-1', 'us-west-2', 'eu-west-1', 'eu-central-1', 'ap-southeast-1', 'ap-northeast-1'];

                for (const tryRegion of regions) {
                    if (tryRegion === region) continue; // Skip the region we already tried

                    try {
                        const retryHost = `${bucketName}.s3.${tryRegion}.amazonaws.com`;
                        const retryUrl = `https://${retryHost}/${encodeURIComponent(key)}`;

                        const retryHeaders = createAWSSignatureV4(
                            configuration,
                            'HEAD',
                            path,
                            '',
                            { 'Host': retryHost },
                            '',
                            tryRegion,
                            's3'
                        );

                        const retryResponse = await makeAwsRequest('HEAD', retryUrl, retryHeaders, null, configuration);

                        postResult({
                            Key: key,
                            Size: parseInt(retryResponse.headers['content-length'] || '0'),
                            LastModified: new Date(retryResponse.headers['last-modified'] || new Date()),
                            ContentType: retryResponse.headers['content-type'] || 'application/octet-stream',
                            ETag: (retryResponse.headers.etag || '').replace(/"/g, '')
                        });
                        return;
                    } catch (retryError: any) {
                        // Continue to next region if this one fails
                        continue;
                    }
                }

                // If we couldn't find the bucket in any region, throw the original error
                throw new Error(`Could not find bucket ${bucketName} in any region. Original error: ${error.message}`);
            }
            throw error;
        }

    } catch (error: any) {
        throw new Error(`GetObject failed: ${error.message}`);
    }
}

// Upload object to S3 - FIXED FOR CLEARSCRIPT
async function onexecuteUploadObject(
    properties: SingleRecord,
    parameters: SingleRecord,
    configuration: SingleRecord
): Promise<void> {
    const bucketName = properties.BucketName as string;
    const key = properties.Key as string;
    let fileContent = parameters.FileContent as string;
    const contentType = parameters.ContentType as string;
    const isBase64 = parameters.IsBase64 as boolean;
    // Removed: const overrideContentLength = parameters.ContentLength as number;

    console.log("UploadObject called with:", {
        bucketName,
        key,
        contentType,
        isBase64,
        contentLength: fileContent ? fileContent.length : 0
    });

    if (!bucketName || !key) {
        throw new Error("BucketName and Key are required");
    }

    if (!fileContent) {
        throw new Error("FileContent must be provided");
    }

    try {
        // Find the correct region for the bucket
        const region = await findBucketRegion(bucketName, configuration);
        const host = `${bucketName}.s3.${region}.amazonaws.com`;
        const url = `https://${host}/${encodeURIComponent(key)}`;
        const path = `/${key}`;

        let bodyToSend: string = fileContent;
        let signatureBody: string = fileContent;
        let finalContentType = contentType || 'application/octet-stream';
        let actualContentLength: number;
        let originalFileSize: number = 0;

        if (isBase64) {
            // Extract base64 content if wrapped
            if (fileContent.includes('<content>')) {
                bodyToSend = getBase64FromContent(fileContent);
            } else {
                bodyToSend = fileContent;
            }
            bodyToSend = bodyToSend.trim();

            console.log("Processing base64 content");
            console.log("Base64 length:", bodyToSend.length);

            // For signature calculation, we need the decoded binary
            try {
                signatureBody = Base64.decodeBinary(bodyToSend);
                originalFileSize = signatureBody.length;
                console.log("Decoded length for signature:", signatureBody.length);
            } catch (e) {
                console.error("Failed to decode base64 for signature:", e);
                throw new Error("Invalid base64 content");
            }

            // For ClearScript XMLHttpRequest, we MUST send the base64 string
            console.log("Will send as base64 to avoid XMLHttpRequest binary issues");

            // Use the base64 length for Content-Length
            actualContentLength = bodyToSend.length;

        } else {
            // For text content, calculate UTF-8 byte length
            actualContentLength = getStringByteLength(bodyToSend);
            originalFileSize = actualContentLength;
            signatureBody = bodyToSend;
        }

        // Determine content type from extension if not provided
        if (!contentType && key) {
            const extension = key.split('.').pop()?.toLowerCase();
            const contentTypeMap: { [key: string]: string } = {
                'txt': 'text/plain',
                'json': 'application/json',
                'xml': 'application/xml',
                'html': 'text/html',
                'css': 'text/css',
                'js': 'application/javascript',
                'pdf': 'application/pdf',
                'jpg': 'image/jpeg',
                'jpeg': 'image/jpeg',
                'png': 'image/png',
                'gif': 'image/gif',
                'bmp': 'image/bmp',
                'doc': 'application/msword',
                'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'xls': 'application/vnd.ms-excel',
                'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'zip': 'application/zip'
            };
            finalContentType = contentTypeMap[extension || ''] || 'application/octet-stream';
        }

        console.log("Upload parameters:");
        console.log("- Region:", region);
        console.log("- Content-Type:", finalContentType);
        console.log("- Content-Length (calculated):", actualContentLength);
        console.log("- Original file size:", originalFileSize);

        // Create headers with K2 metadata
        const uploadHeaders: any = {
            'Host': host,
            'Content-Type': finalContentType,
            'Content-Length': actualContentLength.toString(),
            // Add K2 metadata
            'x-amz-meta-k2-uploaded': 'true',
            'x-amz-meta-k2-base64': isBase64 ? 'true' : 'false',
            'x-amz-meta-k2-original-size': originalFileSize.toString(),
            'x-amz-meta-k2-upload-date': new Date().toISOString()
        };

        // Create signature with metadata headers
        const headers = createAWSSignatureV4ForUpload(
            configuration,
            'PUT',
            path,
            '',
            uploadHeaders,
            bodyToSend,
            region,
            's3',
            false
        );

        console.log("Request headers:", JSON.stringify(headers, null, 2));

        // Make the request
        const response = await makeAwsRequest('PUT', url, headers, bodyToSend, configuration);

        console.log("Upload successful!");
        console.log("Response status:", response.status);
        console.log("ETag:", response.headers.etag);

        postResult({
            Key: key,
            ETag: (response.headers.etag || '').replace(/"/g, ''),
            Size: actualContentLength,
            Status: 'Success' + (isBase64 ? ' (stored as base64 with K2 metadata)' : '')
        });

    } catch (error: any) {
        console.error("UploadObject failed:", error);
        throw new Error(`UploadObject failed: ${error.message}`);
    }
}

// Download object from S3 
async function onexecuteDownloadObject(
    properties: SingleRecord,
    parameters: SingleRecord,
    configuration: SingleRecord
): Promise<void> {
    const bucketName = properties.BucketName as string;
    const key = properties.Key as string;
    const returnAsBase64 = parameters.ReturnAsBase64 as boolean;

    if (!bucketName || !key) {
        throw new Error("BucketName and Key are required");
    }

    try {
        // Find the correct region for the bucket
        const region = await findBucketRegion(bucketName, configuration);
        const host = `${bucketName}.s3.${region}.amazonaws.com`;
        const url = `https://${host}/${encodeURIComponent(key)}`;
        const path = `/${key}`;

        // First, make a HEAD request to get metadata
        console.log("Checking file metadata...");
        const headHeaders = createAWSSignatureV4(
            configuration,
            'HEAD',
            path,
            '',
            { 'Host': host },
            '',
            region,
            's3'
        );

        let isK2Upload = false;
        let isK2Base64 = false;
        let k2OriginalSize = 0;

        try {
            const headResponse = await makeAwsRequest('HEAD', url, headHeaders, null, configuration);

            // Check for K2 metadata
            const k2Uploaded = headResponse.headers['x-amz-meta-k2-uploaded'];
            const k2Base64 = headResponse.headers['x-amz-meta-k2-base64'];
            const k2Size = headResponse.headers['x-amz-meta-k2-original-size'];

            isK2Upload = k2Uploaded === 'true';
            isK2Base64 = k2Base64 === 'true';
            k2OriginalSize = parseInt(k2Size || '0');

            console.log("K2 Metadata found:", {
                k2Uploaded,
                k2Base64,
                k2OriginalSize,
                uploadDate: headResponse.headers['x-amz-meta-k2-upload-date']
            });
        } catch (e) {
            console.log("Could not get metadata, assuming non-K2 upload");
        }

        // Now download the file
        const getHeaders = createAWSSignatureV4(
            configuration,
            'GET',
            path,
            '',
            { 'Host': host },
            '',
            region,
            's3'
        );

        const response = await makeAwsRequest('GET', url, getHeaders, null, configuration);

        // Extract filename from key
        const fileName = key.split('/').pop() || key;

        // Get content
        let content = response.data;
        const storedContentType = response.headers['content-type'] || '';
        const originalSize = parseInt(response.headers['content-length'] || '0');

        console.log("Downloaded file info:", {
            key,
            fileName,
            storedContentType,
            contentLength: content.length,
            isK2Upload,
            isK2Base64,
            returnAsBase64
        });

        // Determine the actual content type based on file extension
        const extension = fileName.split('.').pop()?.toLowerCase() || '';
        const contentTypeMap: { [key: string]: string } = {
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'gif': 'image/gif',
            'pdf': 'application/pdf',
            'txt': 'text/plain',
            'json': 'application/json',
            'xml': 'application/xml',
            'html': 'text/html',
            'css': 'text/css',
            'js': 'application/javascript'
        };

        let actualContentType = contentTypeMap[extension] || storedContentType || 'application/octet-stream';

        // Check if this is a text file type
        const textExtensions = ['txt', 'json', 'xml', 'html', 'css', 'js', 'csv'];
        const isTextFile = textExtensions.includes(extension) || actualContentType.startsWith('text/');

        let finalContent: string;
        let finalSize = originalSize;

        if (isK2Upload && isK2Base64) {
            // This file was uploaded via K2 broker as base64
            // The content IS the base64 of the original file
            console.log("File was uploaded via K2 as base64");

            if (returnAsBase64) {
                // Return the base64 as stored
                finalContent = content.trim();
                finalSize = k2OriginalSize || originalSize;
                console.log("Returning stored base64 content");
            } else {
                // Decode to get original binary
                try {
                    finalContent = Base64.decodeBinary(content.trim());
                    finalSize = finalContent.length;
                    console.log("Decoded base64 to original binary");
                } catch (e) {
                    console.error("Failed to decode K2 base64:", e);
                    finalContent = content;
                }
            }
        } else if (isK2Upload && !isK2Base64) {
            // Text file uploaded via K2
            console.log("Text file uploaded via K2");

            if (returnAsBase64) {
                finalContent = Base64.encode(content);
            } else {
                finalContent = content;
            }
        } else {
            // File not uploaded via K2 broker
            console.log("File was NOT uploaded via K2 broker");

            if (!isTextFile) {
                // Binary file - will be corrupted by XMLHttpRequest
                console.warn("WARNING: Binary file not uploaded via K2 - data will be corrupted!");
                console.warn("For binary files, please upload through K2 broker or use pre-signed URLs");
            }

            if (returnAsBase64) {
                // Encode whatever we got (may be corrupted if binary)
                finalContent = Base64.encode(content);
            } else {
                finalContent = content;
            }
        }

        postResult({
            Key: key,
            ContentType: actualContentType,
            Size: finalSize,
            FileContent: finalContent,
            FileName: fileName,
            Status: isK2Upload ? 'Success (K2 uploaded file)' : 'Success (External file - may be corrupted if binary)'
        });

    } catch (error: any) {
        throw new Error(`DownloadObject failed: ${error.message}`);
    }
}
// Delete object from S3
async function onexecuteDeleteObject(properties: SingleRecord, configuration: SingleRecord): Promise<void> {
    const bucketName = properties.BucketName as string;
    const key = properties.Key as string;

    if (!bucketName || !key) {
        throw new Error("BucketName and Key are required");
    }

    try {
        // Find the correct region for the bucket
        const region = await findBucketRegion(bucketName, configuration);
        const host = `${bucketName}.s3.${region}.amazonaws.com`;
        const url = `https://${host}/${encodeURIComponent(key)}`;
        const path = `/${key}`;

        const headers = createAWSSignatureV4(
            configuration,
            'DELETE',
            path,
            '',
            { 'Host': host },
            '',
            region,
            's3'
        );

        await makeAwsRequest('DELETE', url, headers, null, configuration);

        postResult({
            Key: key,
            Status: 'Success'
        });

    } catch (error: any) {
        throw new Error(`DeleteObject failed: ${error.message}`);
    }
}