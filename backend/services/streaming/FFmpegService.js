const { spawn } = require('child_process');
require('dotenv').config();

let currentFFmpegProcess = null;
const STORAGE_PATH = process.env.STORAGE_PATH;

function startFFmpeg(nextChannel) {
    console.log('Starting FFmpeg process...');
    if (currentFFmpegProcess) {
        console.log('Gracefully terminate previous ffmpeg-Prozess...');
        currentFFmpegProcess.kill('SIGTERM');
    }

    const channelUrl = nextChannel.url;
    const channelId = nextChannel.id;
    const headers = nextChannel.headers;


    currentFFmpegProcess = spawn('ffmpeg', [
        '-headers', headers.map(header => `${header.key}: ${header.value}`).join('\r\n'),
        '-i', channelUrl,
        '-c', 'copy',
        '-f', 'hls',
        '-hls_time', '6',
        '-hls_list_size', '5',
        '-hls_flags', 'delete_segments+program_date_time',
        '-start_number', Math.floor(Date.now() / 1000),
        `${STORAGE_PATH}${channelId}/${channelId}.m3u8`
    ]);

    // currentFFmpegProcess.stdout.on('data', (data) => {
    //     console.log(`stdout: ${data}`);
    // });

    // currentFFmpegProcess.stderr.on('data', (data) => {
    //     console.error(`stderr: ${data}`);
    // });

    currentFFmpegProcess.on('close', (code) => {
        console.log(`ffmpeg-Process terminated with code: ${code}`);
        currentFFmpegProcess = null;

        //Restart if crashed
        if (code && code !== 255) {
            console.log(`Restarting FFmpeg process...`);
            startFFmpeg(nextChannel);
        }
    });
}

function stopFFmpeg() {
    if (currentFFmpegProcess) {
        console.log('Gracefully terminate ffmpeg-Process...');
        currentFFmpegProcess.kill('SIGTERM');
        currentFFmpegProcess = null;
    }
}

function isFFmpegRunning() {
    return currentFFmpegProcess !== null;
}

module.exports = {
    startFFmpeg,
    stopFFmpeg,
    isFFmpegRunning
};
