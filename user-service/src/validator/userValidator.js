import { getUserByEmailService } from "../service/userService.js";
import { 
    hashPassword, 
    validateEmail, 
    validatePassword 
} from "../util/userUtil.js";

export const validateRegisterRequest = async(userReq) => {
    const errors = {};

    const { name, email, password, confirmPassword } = userReq;
    
    if (!name || name.trim() === '') {
        errors.name = 'Name is required';
    } else if (name.length < 5) {
        errors.name = 'Name too short (5 characters minimum)';
    }

    if(!validateEmail(email)) {
        errors.email = 'Invalid email format';
    }

    if(!validatePassword(password)) {
        errors.password = 'Password must be at least 8 characters long, also must include letters and numbers';
    }

    if(password !== confirmPassword) {
        errors.confirmPassword = 'Password does not match';
    }

    const user = await getUserByEmailService(email);
    if(user) {
        errors.email = 'Email already exist';
    }
    return errors
}

export const validateLoginRequest = async(userReq) => {
    const errors = {};

    const { email, password } = userReq;

    if(!email || email.trim() === '') {
        errors.email = 'Email is required';
    }

    if(!password || password.trim() === '') {
        errors.password = 'Password is required';
    }

    if(!validateEmail(email)) {
        errors.email = 'Invalid email format';
    }

    if(!validatePassword(password)) {
        errors.password = 'Password must be at least 8 characters long, also must include letters and numbers';
    }

    try {
        const user = await getUserByEmailService(email);
        const hashedPassword = hashPassword(password);
        if(!user) {
            errors.password = 'Invalid credentials';
        } else if(user.password_hash !== hashedPassword) {
            errors.password = 'Invalid credentials';
        }
    } catch(err) {
        errors.general = 'Invalid credentials';
    }


    return errors
}