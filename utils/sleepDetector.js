// Sleep command detector - natural language
function detectSleepCommand(content) {
  const sleepPatterns = [
    /\b(ngủ đi|đi ngủ|ngủ thôi|nghỉ ngơi đi|nghỉ đi|휴식|sleep|rest)\b/i,
    /\b(mệt rồi|đi ngủ nào|ngủ nào|휴식 해|sleep now)\b/i
  ];
  
  return sleepPatterns.some(pattern => pattern.test(content));
}

module.exports = {
  detectSleepCommand
};
