import { getPasswordHashByIdService, getUserByEmailService } from "../service/userService.js";
import { 
    hashPassword, 
    validateEmail, 
    validatePassword, 
    validatePhoneNumber
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

export const validateRegisterSellerRequest = async(userReq) => {
    const errors = {};

    const { name, email, password, confirmPassword, restaurantName, restaurantAddress } = userReq;
    
    if (!name || name.trim() === '') {
        errors.name = 'Name is required';
    } else if (name.length < 5) {
        errors.name = 'Name too short (5 characters minimum)';
    }

    if(!restaurantName || restaurantName.trim() === '') {
        errors.restaurantName = 'Restaurant name is required';
    } else if(restaurantName.length < 5) {
        errors.restaurantName = 'Restaurant name too short (5 characters minimum)';
    }

    if(!restaurantAddress || restaurantAddress.trim() === '') {
        errors.restaurantAddress = 'Restaurant address is required';
    } else if(restaurantAddress.length < 10) {
        errors.restaurantAddress = 'Restaurant address too short (10 characters minimum)';
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

        if(!user.is_verified) {
            errors.email = 'Email is not verified';
        }
    } catch(err) {
        errors.general = 'Invalid credentials';
    }


    return errors
}

export const validateUpdateProfileRequest = async(userReq) => {
    const errors = {};

    const { name, profile_photo, address, phone_number } = userReq;
    
    if (!name || name.trim() === '') {
        errors.name = 'Name is required';
    } else if (name.length < 5) {
        errors.name = 'Name too short (5 characters minimum)';
    }

    if(phone_number && !validatePhoneNumber(phone_number)) {
        errors.phone_number = 'Invalid phone number';
    }

    return errors
}

export const validateChangePasswordRequest = async(userReq, userId) => {
    const errors = {};

    const {currentPassword, newPassword, confirmPassword} = userReq;

    if(!currentPassword || currentPassword.trim() === '') {
        errors.currentPassword = 'Current password is required';
    } else if(!validatePassword(currentPassword)) {
        errors.currentPassword = 'Password must be at least 8 characters long, also must include letters and numbers';
    }

    if(!newPassword || newPassword.trim() === '') {
        errors.newPassword = 'New password is required';
    } else if(!validatePassword(newPassword)) {
        errors.newPassword = 'Password must be at least 8 characters long, also must include letters and numbers';
    }

    if(!confirmPassword || confirmPassword.trim() === '') {
        errors.confirmPassword = 'Confirm password is required';
    } else if(!validatePassword(confirmPassword)) {
        errors.confirmPassword = 'Password must be at least 8 characters long, also must include letters and numbers';
    }

    if(newPassword !== confirmPassword) {
        errors.confirPassword = 'Password does not match';
    }

    if(currentPassword === newPassword) {
        errors.newPassword = 'New password must be different from current password';
    }

    const user = await getPasswordHashByIdService(userId);
    if(!user) {
        errors.currentPassword = 'Invalid current password';
    } else if(user.password_hash !== hashPassword(currentPassword)) {
        errors.currentPassword = 'Invalid current password';
    }
    return errors
}

export const validateUpdateUserPaymentRequest = async(userReq) => {
    const {bcaAccount, gopay, dana} = userReq;
    const errors = {};

    if(!bcaAccount || bcaAccount.trim() === '') {
        errors.bcaAccount = 'BCA account is required';
    } else if(!/^\d{10}$/.test(bcaAccount)) {
        errors.bcaAccount = 'BCA account must be exactly 10 digits';
    }

    if(! gopay || gopay.trim() === '') {
        errors.gopay = 'GoPay number is required';
    } else if(gopay && !/^\d{10,13}$/.test(gopay)) {
        errors.gopay = 'GoPay number must be between 10 and 13 digits';
    }

    if(!dana || dana.trim() === '') {
        errors.dana = 'DANA number is required';
    } else if(dana && !/^\d{10,13}$/.test(dana)) {
        errors.dana = 'DANA number must be between 10 and 13 digits';
    }

    return errors;
}