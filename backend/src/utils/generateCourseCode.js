export const generateCourseCode = (length = 8) => {
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lower = 'abcdefghijklmnopqrstuvwxyz';
    const digits = '0123456789';
    const all = upper + lower + digits;

    // Ensure at least one of each
    let code = [
        upper.charAt(Math.floor(Math.random() * upper.length)),
        lower.charAt(Math.floor(Math.random() * lower.length)),
        digits.charAt(Math.floor(Math.random() * digits.length))
    ];

    // Fill the rest randomly
    for (let i = code.length; i < length; i++) {
        code.push(all.charAt(Math.floor(Math.random() * all.length)));
    }

    // Shuffle the code array
    for (let i = code.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [code[i], code[j]] = [code[j], code[i]];
    }

    return code.join('');
}