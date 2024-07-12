import Head from "next/head";
import Image from "next/image";
import {Inter} from "next/font/google";
import styles from "@/styles/Home.module.css";
import Vips from 'wasm-vips';
import {useEffect, useState} from "react";

const inter = Inter({subsets: ["latin"]});

async function processImage(vips, svgBuffer, width, height, sizeOption, quality, chromaSubsampling) {
    // 将 SVG 字符串转换为 Uint8Array

    // 确保 wasm-vips 已经初始化
    // await Vips.init();

    // 从 SVG 缓冲区创建 Vips.Image
    const image = vips.Image.newFromBuffer(svgBuffer);

    // 准备调整大小的选项
    let factor;
    if (sizeOption !== '0') {
        // 计算维持宽高比的缩放因子
        factor = Math.min(
            width ? width / image.width : Infinity,
            height ? height / image.height : Infinity
        );
    } else {
        // 如果不保持宽高比，分别计算宽度和高度的缩放因子
        factor = {
            hscale: width ? width / image.width : 1,
            vscale: height ? height / image.height : 1
        };
    }

    // 调整图像大小
    const resizedImage = image.resize(factor);

    // 设置 JPEG 输出选项
    const jpegOptions = {
        Q: quality,
        strip: true,
        interlace: true, // 对应 sharp 中的 'progressive' 选项
        // subsample_mode: chromaSubsampling === '4:4:4' ? 'no' : 'auto'
    };

    // 将处理后的图像写入 JPEG 缓冲区
    const outputBuffer = resizedImage.writeToBuffer('.jpg', jpegOptions);

    // 清理内存
    // resizedImage.unref();
    // image.unref();

    // 关闭 wasm-vips
    vips.shutdown();

    // 将 Uint8Array 转换为 Blob
    const blob = new Blob([outputBuffer], {type: 'image/jpeg'});

    return blob;
}


export default function Home() {
    const [url, setUrl] = useState('')
    useEffect(() => {
        Vips({
            // Disable dynamic modules
            dynamicLibraries: ['vips-resvg.wasm'],
            // Workers needs to import the unbundled version of `vips.js`
            mainScriptUrlOrBlob: './vips.js',
            // wasm-vips is served from the public directory
            locateFile: (fileName, scriptDirectory) => fileName,
            preRun: (module) => {
                module.setAutoDeleteLater(!document.referrer.includes('disableAutoDelete'));
                module.setDelayFunction((fn) => {
                    globalThis.cleanup = fn;
                });
                const images = [
                    'owl.jpg', 'owl.tif', 'owl.webp', 'owl.jxl', 'owl.avif',
                    'banana.webp', 'banana.gif',
                    'alphachannel.svg', 'transparency_demo.png'
                ];
                for (const image of images)
                    module.FS.createPreloadedFile('/', image, '/images/' + image, true, false);

            }
        }).then((vips) => {
            console.log('libvips version:', vips.version());

            let svg = `<svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4.5 12a7.5 7.5 0 0015 0m-15 0a7.5 7.5 0 1115 0m-15 0H3m16.5 0H21m-1.5 0H12m-8.457 3.077l1.41-.513m14.095-5.13l1.41-.513M5.106 17.785l1.15-.964m11.49-9.642l1.149-.964M7.501 19.795l.75-1.3m7.5-12.99l.75-1.3m-6.063 16.658l.26-1.477m2.605-14.772l.26-1.477m0 17.726l-.26-1.477M10.698 4.614l-.26-1.477M16.5 19.794l-.75-1.299M7.5 4.205L12 12m6.894 5.785l-1.149-.964M6.256 7.178l-1.15-.964m15.352 8.864l-1.41-.513M4.954 9.435l-1.41-.514M12.002 12l-3.75 6.495"
    />
  </svg>`;


            // let bo = new Blob([svg], {type: 'image/svg+xml'});
            // const path = URL.createObjectURL( bo );
            // let im = vips.Image.svgloadBuffer(new Blob([svg], {type: 'image/svg+xml'}), { dpi: 300 });
            // let im = vips.Image.newFromBuffer(`
            // `);
            // let im = vips.Image.newFromFile('owl.jpg');
            // 最好直接使用Unit8Array

// 将 SVG 字符串转换为 Uint8Array
//         const textEncoder = new TextEncoder();
//         const svgBuffer = textEncoder.encode(svg);
            // 这是你提供的字节序列，代表 SVG 数据
            const byteSequence = [
                60, 115, 118, 103, 32, 119, 105, 100, 116, 104, 61, 34, 56, 52, 34, 32,
                104, 101, 105, 103, 104, 116, 61, 34, 54, 50, 34, 32, 118, 105, 101, 119,
                66, 111, 120, 61, 34, 48, 32, 48, 32, 56, 52, 32, 54, 50, 34, 32, 102, 105,
                108, 108, 61, 34, 110, 111, 110, 101, 34, 32, 120, 109, 108, 110, 115, 61,
                34, 104, 116, 116, 112, 58, 47, 47, 119, 119, 119, 46, 119, 51, 46, 111, 114,
                103, 47, 50, 48, 48, 48, 47, 115, 118, 103, 34, 62, 10, 60, 112, 97, 116,
                104, 32, 100, 61, 34, 77, 52, 50, 32, 48, 76, 56, 51, 46, 53, 54, 57, 50, 32,
                54, 49, 46, 53, 72, 48, 46, 52, 51, 48, 55, 56, 50, 76, 52, 50, 32, 48, 90,
                34, 32, 102, 105, 108, 108, 61, 34, 35, 68, 57, 68, 57, 68, 57, 34, 47, 62, 10,
                60, 47, 115, 118, 103, 62, 10
            ];

// 使用这个字节序列创建 Uint8Array
            const svgUint8Array = new Uint8Array(byteSequence);

// 现在 svgUint8Array 包含了 SVG 数据的 Uint8Array 表示
            console.log(svgUint8Array);


// 使用示例
            const width = 1000; // 你希望的宽度
            const height = 1000; // 你希望的高度
            const sizeOption = '1'; // '0' 表示不保持宽高比
            const quality = 100; // JPEG 质量
            const chromaSubsampling = '4:4:4'; // 色度二次采样选项

// 在调用此函数之前不要忘记初始化 vips
            processImage(vips, svgUint8Array.buffer, width, height, sizeOption, quality, chromaSubsampling)
                .then((blob) => {
                    // 使用 Blob，例如通过创建一个 ObjectURL 来显示图像
                    const url = URL.createObjectURL(blob);
                    const img = document.createElement('img');
                    img.src = url;
                    document.body.appendChild(img);
                })
                .catch((error) => {
                    console.error('处理图像时出错:', error);
                });


            // let im = vips.Image.newFromBuffer(svgUint8Array.buffer);
            //
            // im = im.resize(2);
            //
            //
            // const outBuffer = im.writeToBuffer('.jpg');
            // const blob = new Blob( [ outBuffer ] );
            // const url = URL.createObjectURL( blob );
            // setUrl(url)
            // console.log(outBuffer)
        });
    }, []);

    /**
     * I managed to use a canvas to convert SVG to png data URI, then fetch that to a blob, and then convert that to a uint8array to pass to newFromBuffer
     */
    return (
        <>

            <main className={`${styles.main} ${inter.className}`}>

            </main>
        </>
    );
}
