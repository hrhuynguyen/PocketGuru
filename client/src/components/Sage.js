import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
const palette = {
    body: '#8B5A2B', bodyDark: '#6B4220', belly: '#F4D9A8', bellyDark: '#E0BD81',
    beak: '#FFA228', beakDark: '#D9810A', eyeWhite: '#FFFFFF', eyeBorder: '#3C3C3C',
    pupil: '#2A2A2A', feet: '#FFA228', accent: '#58CC02', cheek: '#FF8FB4',
};
const POSES = {
    wave: { tilt: -3, leftWingY: 0, rightWingY: -10, mouth: 'smile', eyes: 'open', accessory: null, bounce: true },
    read: { tilt: 0, leftWingY: 8, rightWingY: 8, mouth: 'tiny', eyes: 'down', accessory: 'book', bounce: false },
    happy: { tilt: 0, leftWingY: -6, rightWingY: -6, mouth: 'open', eyes: 'happy', accessory: 'star', bounce: true },
    think: { tilt: 4, leftWingY: 6, rightWingY: 0, mouth: 'tiny', eyes: 'up', accessory: 'qmark', bounce: false },
    sleepy: { tilt: -2, leftWingY: 6, rightWingY: 6, mouth: 'tiny', eyes: 'closed', accessory: 'zzz', bounce: false },
    cheer: { tilt: 0, leftWingY: -16, rightWingY: -16, mouth: 'open', eyes: 'happy', accessory: 'confetti', bounce: true },
};
export function Sage({ pose = 'wave', size = 120, animated = true }) {
    const c = palette;
    const p = POSES[pose];
    const bounce = p.bounce && animated;
    return (_jsxs("svg", { width: size, height: size, viewBox: "0 0 200 200", style: { display: 'block' }, children: [_jsxs("g", { transform: `rotate(${p.tilt} 100 110)`, className: bounce ? 'bounce' : '', children: [_jsx("ellipse", { cx: "78", cy: "178", rx: "11", ry: "6", fill: c.feet }), _jsx("ellipse", { cx: "122", cy: "178", rx: "11", ry: "6", fill: c.feet }), _jsx("line", { x1: "74", y1: "178", x2: "70", y2: "184", stroke: c.beakDark, strokeWidth: "2.5", strokeLinecap: "round" }), _jsx("line", { x1: "78", y1: "180", x2: "78", y2: "186", stroke: c.beakDark, strokeWidth: "2.5", strokeLinecap: "round" }), _jsx("line", { x1: "82", y1: "178", x2: "86", y2: "184", stroke: c.beakDark, strokeWidth: "2.5", strokeLinecap: "round" }), _jsx("line", { x1: "118", y1: "178", x2: "114", y2: "184", stroke: c.beakDark, strokeWidth: "2.5", strokeLinecap: "round" }), _jsx("line", { x1: "122", y1: "180", x2: "122", y2: "186", stroke: c.beakDark, strokeWidth: "2.5", strokeLinecap: "round" }), _jsx("line", { x1: "126", y1: "178", x2: "130", y2: "184", stroke: c.beakDark, strokeWidth: "2.5", strokeLinecap: "round" }), _jsx("ellipse", { cx: "100", cy: "115", rx: "62", ry: "60", fill: c.body }), _jsx("ellipse", { cx: "100", cy: "125", rx: "44", ry: "44", fill: c.belly }), _jsx("g", { className: bounce ? 'wing' : '', children: _jsx("ellipse", { cx: "42", cy: 120 + p.leftWingY, rx: "14", ry: "26", fill: c.bodyDark, transform: `rotate(-12 42 ${120 + p.leftWingY})` }) }), _jsx("ellipse", { cx: "158", cy: 120 + p.rightWingY, rx: "14", ry: "26", fill: c.bodyDark, transform: `rotate(12 158 ${120 + p.rightWingY})` }), _jsx("path", { d: "M48 82 Q100 30 152 82 Q150 60 100 50 Q50 60 48 82 Z", fill: c.bodyDark }), _jsx("path", { d: "M62 60 L52 38 L72 50 Z", fill: c.bodyDark }), _jsx("path", { d: "M138 60 L148 38 L128 50 Z", fill: c.bodyDark }), _jsx("circle", { cx: "78", cy: "92", r: "22", fill: c.eyeWhite, stroke: c.eyeBorder, strokeWidth: "3" }), _jsx("circle", { cx: "122", cy: "92", r: "22", fill: c.eyeWhite, stroke: c.eyeBorder, strokeWidth: "3" }), _jsx(Eyes, { pose: p.eyes, c: c, animated: animated }), (p.eyes === 'happy' || p.mouth === 'open') && (_jsxs(_Fragment, { children: [_jsx("circle", { cx: "62", cy: "116", r: "5", fill: c.cheek, opacity: "0.6" }), _jsx("circle", { cx: "138", cy: "116", r: "5", fill: c.cheek, opacity: "0.6" })] })), _jsx(Beak, { mouth: p.mouth, c: c })] }), p.accessory === 'book' && _jsx(BookProp, {}), p.accessory === 'star' && _jsx(StarProp, {}), p.accessory === 'qmark' && _jsx(QMarkProp, {}), p.accessory === 'zzz' && _jsx(ZzzProp, {}), p.accessory === 'confetti' && _jsx(ConfettiProp, {})] }));
}
function Eyes({ pose, c, animated }) {
    if (pose === 'closed' || pose === 'sleepy') {
        return (_jsxs("g", { children: [_jsx("path", { d: "M68 92 Q78 88 88 92", stroke: c.eyeBorder, strokeWidth: "3", fill: "none", strokeLinecap: "round" }), _jsx("path", { d: "M112 92 Q122 88 132 92", stroke: c.eyeBorder, strokeWidth: "3", fill: "none", strokeLinecap: "round" })] }));
    }
    if (pose === 'happy') {
        return (_jsxs("g", { children: [_jsx("path", { d: "M68 96 Q78 84 88 96", stroke: c.eyeBorder, strokeWidth: "3.5", fill: "none", strokeLinecap: "round" }), _jsx("path", { d: "M112 96 Q122 84 132 96", stroke: c.eyeBorder, strokeWidth: "3.5", fill: "none", strokeLinecap: "round" })] }));
    }
    let dx = 0, dy = 0;
    if (pose === 'down')
        dy = 4;
    if (pose === 'up')
        dy = -4;
    if (pose === 'left')
        dx = -4;
    if (pose === 'right')
        dx = 4;
    return (_jsxs("g", { className: animated ? 'blink' : '', children: [_jsx("circle", { cx: 78 + dx, cy: 92 + dy, r: "8", fill: c.pupil }), _jsx("circle", { cx: 122 + dx, cy: 92 + dy, r: "8", fill: c.pupil }), _jsx("circle", { cx: 80 + dx, cy: 89 + dy, r: "2.5", fill: c.eyeWhite }), _jsx("circle", { cx: 124 + dx, cy: 89 + dy, r: "2.5", fill: c.eyeWhite })] }));
}
function Beak({ mouth, c }) {
    if (mouth === 'open') {
        return (_jsxs("g", { children: [_jsx("path", { d: "M88 115 Q100 132 112 115 Q100 122 88 115 Z", fill: c.beakDark }), _jsx("path", { d: "M88 115 Q100 128 112 115 L100 112 Z", fill: c.beak })] }));
    }
    if (mouth === 'tiny') {
        return _jsx("path", { d: "M93 115 L100 124 L107 115 Z", fill: c.beak, stroke: c.beakDark, strokeWidth: "1.5", strokeLinejoin: "round" });
    }
    return (_jsxs("g", { children: [_jsx("path", { d: "M90 113 L100 126 L110 113 Z", fill: c.beak, stroke: c.beakDark, strokeWidth: "1.5", strokeLinejoin: "round" }), _jsx("path", { d: "M93 124 Q100 129 107 124", stroke: c.beakDark, strokeWidth: "1.5", fill: "none", strokeLinecap: "round" })] }));
}
function BookProp() {
    return (_jsxs("g", { children: [_jsx("rect", { x: "72", y: "138", width: "56", height: "34", rx: "3", fill: "#FFC800", stroke: "#3C3C3C", strokeWidth: "2.5" }), _jsx("line", { x1: "100", y1: "140", x2: "100", y2: "170", stroke: "#3C3C3C", strokeWidth: "2" }), _jsx("line", { x1: "80", y1: "148", x2: "94", y2: "148", stroke: "#3C3C3C", strokeWidth: "1.5", strokeLinecap: "round" }), _jsx("line", { x1: "80", y1: "155", x2: "92", y2: "155", stroke: "#3C3C3C", strokeWidth: "1.5", strokeLinecap: "round" }), _jsx("line", { x1: "80", y1: "162", x2: "93", y2: "162", stroke: "#3C3C3C", strokeWidth: "1.5", strokeLinecap: "round" }), _jsx("line", { x1: "106", y1: "148", x2: "120", y2: "148", stroke: "#3C3C3C", strokeWidth: "1.5", strokeLinecap: "round" }), _jsx("line", { x1: "106", y1: "155", x2: "118", y2: "155", stroke: "#3C3C3C", strokeWidth: "1.5", strokeLinecap: "round" })] }));
}
function StarProp() {
    return (_jsx("g", { transform: "translate(150 30)", children: _jsx("path", { d: "M0 -14 L4 -4 L14 -4 L6 3 L9 13 L0 7 L-9 13 L-6 3 L-14 -4 L-4 -4 Z", fill: "#FFC800", stroke: "#3C3C3C", strokeWidth: "2", strokeLinejoin: "round" }) }));
}
function QMarkProp() {
    return (_jsxs("g", { transform: "translate(150 36)", children: [_jsx("circle", { r: "16", fill: "#1CB0F6", stroke: "#3C3C3C", strokeWidth: "2.5" }), _jsx("text", { x: "0", y: "6", textAnchor: "middle", fontSize: "22", fontFamily: "Nunito", fontWeight: "900", fill: "white", children: "?" })] }));
}
function ZzzProp() {
    return (_jsxs("g", { fill: "#3C3C3C", fontFamily: "Nunito", fontWeight: "900", children: [_jsx("text", { x: "148", y: "44", fontSize: "14", children: "z" }), _jsx("text", { x: "158", y: "34", fontSize: "18", children: "Z" }), _jsx("text", { x: "170", y: "22", fontSize: "22", children: "Z" })] }));
}
function ConfettiProp() {
    const bits = [
        { x: 30, y: 30, c: '#FFC800', r: 6 },
        { x: 168, y: 38, c: '#FF4B8B', r: 5 },
        { x: 22, y: 80, c: '#1CB0F6', r: 5 },
        { x: 178, y: 78, c: '#CE82FF', r: 6 },
        { x: 40, y: 14, c: '#58CC02', r: 4 },
        { x: 158, y: 16, c: '#FF9600', r: 5 },
    ];
    return (_jsx("g", { children: bits.map((b, i) => (_jsx("rect", { x: b.x, y: b.y, width: b.r * 2, height: b.r * 2, fill: b.c, transform: `rotate(${i * 30} ${b.x + b.r} ${b.y + b.r})` }, i))) }));
}
export function SageBadge({ size = 36, pose = 'wave' }) {
    return (_jsx("div", { style: { width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }, children: _jsx(Sage, { pose: pose, size: size, animated: false }) }));
}
