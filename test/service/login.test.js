import AuthService from "../../src/services/auth/authService.js"
import { loginUserDto } from "../variables.test.js"

let user = new AuthService(loginUserDto)

// -> login service
beforeEach(async ()=>{
  await userDetails.setUser(UserDetails)
  await userTwoStep.setUser(TwoStepParams)

})

describe('signin()', function () {
  it('getUser -> should get user obj without errors', async () => {
    await user.signin()
  });
});
