import crypto from 'node:crypto';

// Helper -> help to do some actions like generate or sort some
export class Helper {

  // GeneratePassword > generate unique code by userDto <-
  async GeneratePassword(dto) {
	  const objString = JSON.stringify(dto);
	  const hash = crypto.createHash('sha256');
	  hash.update(objString);
		return hash.digest('hex');
  }
}
