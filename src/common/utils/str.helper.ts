export class StringHelper {
    public static randomStr(length: number = 20): string {
        const char = '1234567890QWERTYUIOPASDFGHJKLZXCVBNM';
        let str = '';

        for (let i = 0; i < length; i++) {
            const random = Math.floor(Math.random() * char.length);
            str += char.charAt(random);
        }

        return str;
    }
}
