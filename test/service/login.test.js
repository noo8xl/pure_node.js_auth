import AuthService from "../../src/services/authService"
import { loginUserDto } from "../variables.test"

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
