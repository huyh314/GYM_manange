import bcrypt from 'bcryptjs';

const generate = async () => {
    const adminHash = await bcrypt.hash('admin123', 10);
    const userHash = await bcrypt.hash('123456', 10);
    console.log(`ADMIN_HASH=${adminHash}`);
    console.log(`USER_HASH=${userHash}`);
};

generate().catch(console.error);
