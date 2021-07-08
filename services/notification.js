const admin = require("firebase-admin");

const serviceAccount = require("../config/firebaseServiceAccountKey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

exports.firebaseSendNotification = async (token, message)=> {
    message.token = token;
    console.log(token)
    console.log(message)
    return await admin.messaging().send(message);
};

//{
  //   "type": "service_account",
  //   "project_id": "maslaha-project",
  //   "private_key_id": "42a89c372cda2614f212da98b37b465e189f607e",
  //   "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDbuLzWL+mE2pWh\nlYWu0ZqAFBgeVxTTkZVHd4rgnE7rMhZzldEErorINQGo1NG4OHYISU0921l5O3sa\nrqTiFjRD5E0jyBTo+09JX0McYJDMXH9txcNoDnUfZmfEmxv+1wrSSo4helPr/hGQ\nhBohCPTwPYUYX0JAfURkwnUhxl8rl7JiJi0WfjnGnJwjb7nD79GVtZIoR4Uqak7t\nVhAj5g2FBpkv4j4VYFD82q5Brm/Nt4omQP6lAyTPHindvtg4Iq9uMEwnkVSUhYV1\nvgc13rHrlN3UOYRsN2PeueY1q5K3ZHvcusgYxY5Zm7quE14TCDERfJkBGZtXG6ZR\n+nYJW+UbAgMBAAECggEABVUV7CLMiYdeg0XkMSpwE/So4y+c10ectlfN3IaembGk\n/tgfcvwjbRlwOV802cIxByF0SPCGWt1ZLvwXD0+XpCApyRkFfOQAeBjiQZGMYhFK\nnGjkxaU4LXNoSEq1YrloT1M04NYdrEgFuBqkobGcdCoiDUXejz8bBlD7076DN8US\nsAKo3n7u8UajDIEPNGz25iZaTn2MVaiS0anB8lITQkTM0pChR+9LGDe600Vsx6ob\nGDJ9KWWh+0DL/w2aR0lPIPV1zAIg5X3b6A1ehjIs90/Pou1VNaagXkF3Rj+TUVeK\n7BzFipwGeZXr5FmGDBYhYkz8oKfPUbUV05tW9/TqlQKBgQD1WIJ+Wv3xaU+NUz4h\nnKqMn3hnD7M2rtbryALlH6KgOWivmBc24BY0uesdFnIgcbMXGbb35xmCNNKlV9eS\n+khsgCXJqENCyIrpDsueMO1a5DUQvPjX67KR8VzrjV1oSSmsNjpIHJL8igG0XBEz\nkp9lSlHt1jNlkykcpt2oRBr9zQKBgQDlQ13Y4LayFCJFmJDtTSX94a0zVHprvk6A\ne2yAOueCKgxQOVHac7pz5mogvb7WOdUqz8PVBmAy1l38x/Wz/zoLMjEEeVySI705\nBrtFRtJpDtBl4UHHTcOCWoSRwqVQBustD2nw/sMYHFBPgvPbiP3tG14GaBKOsM8f\nPuxsqqJGhwKBgCCHQJ3iEIMeVEbHf5hTPiVwyzTW1wrr+WC/Xurj29rkYaXOQ12q\nLieFcs+jdzQn/veUGDcb87zYpgj38YPyHQINp3TqEyjaj9hAduydTgrb8NEsTM3L\n2RwSZSBx2K2H7beAZQ/EghRrc7hm8Hzm9q0mQmCHIr9X2H6M/RxfEzkNAoGAcJKn\nnjqY+tAQFARaBWuAYC1UEoREqGsFuOjh2gUScEOdUDcVDiMNRqO5MOJ6tk4ncaIb\nEprS2aOQ+vJkn0GPirfWgc/luIx7+WhoxBeGcbeodJ4q4mY4veUce0YMTkNXbwTG\njGNMAKbGeIRgoUefB7IMdTDdC9udmEYZaTJQBDkCgYAmLMPTptRD3sfrQ7O/mtac\nm4F/FSoUkTdZ+rjrGb0u6quenl4Fvhr+IwEX6eJjzxdrsjKLUYnmT/al1Zg/YGTw\nIiYQmn2UjYM1HsYvGX2Va2ikpD6IRCOMnRHgWmkyYPskjCf+W08KspAXDAymq34w\n3PxU8bDCtkI+za/i22ptSw==\n-----END PRIVATE KEY-----\n",
  //   "client_email": "firebase-adminsdk-tt1je@maslaha-project.iam.gserviceaccount.com",
  //   "client_id": "100370273823019120247",
  //   "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  //   "token_uri": "https://oauth2.googleapis.com/token",
  //   "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  //   "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-tt1je%40maslaha-project.iam.gserviceaccount.com"
  // }