
/**
 * Test script for Streak Logic in PathCraft-Amana
 * This script mocks the User model behavior to verify the updateStreak method.
 */

class MockUser {
    currentStreak: number = 0;
    longestStreak: number = 0;
    totalActiveDays: number = 0;
    lastActivityDate: Date | null = null;

    async updateStreak(mockNow?: Date): Promise<void> {
        const now = mockNow || new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

        if (!this.lastActivityDate) {
            this.currentStreak = 1;
            this.longestStreak = 1;
            this.totalActiveDays = 1;
            this.lastActivityDate = now;
            return;
        }

        const lastActive = new Date(this.lastActivityDate);
        const lastDate = new Date(lastActive.getFullYear(), lastActive.getMonth(), lastActive.getDate()).getTime();
        const oneDay = 24 * 60 * 60 * 1000;

        if (today === lastDate) return; // Already active today

        this.totalActiveDays += 1;

        if (today - lastDate === oneDay) {
            this.currentStreak += 1; // Consecutive day
            if (this.currentStreak > this.longestStreak) {
                this.longestStreak = this.currentStreak;
            }
        } else {
            this.currentStreak = 1; // Streak broken
        }

        this.lastActivityDate = now;
    }
}

async function runTests() {
    console.log('🧪 Starting Streak Logic Tests...\n');

    const user = new MockUser();

    // Test 1: Initial Activity
    console.log('Test 1: Initial Activity');
    await user.updateStreak(new Date('2026-01-01T10:00:00'));
    assert(user.currentStreak === 1, 'Streak should be 1');
    assert(user.totalActiveDays === 1, 'Total active days should be 1');
    console.log('✅ Passed\n');

    // Test 2: Same Day Activity
    console.log('Test 2: Same Day Activity');
    await user.updateStreak(new Date('2026-01-01T15:00:00'));
    assert(user.currentStreak === 1, 'Streak should remain 1');
    console.log('✅ Passed\n');

    // Test 3: Consecutive Day Activity
    console.log('Test 3: Consecutive Day Activity');
    await user.updateStreak(new Date('2026-01-02T10:00:00'));
    assert(user.currentStreak === 2, 'Streak should be 2');
    assert(user.longestStreak === 2, 'Longest streak should be 2');
    console.log('✅ Passed\n');

    // Test 4: Broken Streak
    console.log('Test 4: Broken Streak');
    await user.updateStreak(new Date('2026-01-05T10:00:00'));
    assert(user.currentStreak === 1, 'Streak should reset to 1');
    assert(user.longestStreak === 2, 'Longest streak should remain 2');
    assert(user.totalActiveDays === 3, 'Total active days should be 3');
    console.log('✅ Passed\n');

    console.log('✨ All Streak Logic Tests Passed!');
}

function assert(condition: boolean, message: string) {
    if (!condition) {
        console.error('❌ Assertion Failed:', message);
        process.exit(1);
    }
}

runTests().catch(err => {
    console.error('💥 Test execution failed:', err);
    process.exit(1);
});
