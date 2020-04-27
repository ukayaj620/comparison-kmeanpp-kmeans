/**
 * tempoin : point sementara dalam bentuk array [x,y]
 * data : titik putih
 * Kclust : Centroid / titik pusat cluster
 * color : warna [R,G,B]
 * partition : persentase bar di bawah layar sebagai indikator cluster
 * prevpar : variable partition loop sebelumnya
 * tendency : point patokan dalam koordinat untuk poin random terkumpul
 */
let tempoin = [],data = [], Kclust = [], color = [], partition = [], prevpar = [];

/**
 * n : jumlah data
 * k : jumlah centroid / cluster
 * fps : frame rate per second
 * -----nilai ini boleh diubah-----
 */
let n=300,k=6,fps=5;

/**
 * updateglobal() : function untuk meng-update gambar tiap proses clustering
 * @param data : data
 * @param cluster : centroid/cluster
 */

function updateglobal(data,cluster){
    for(let i = 0; i < cluster.length; i++){
        cluster[i].update("cluster");
    }
    for(let i = 0; i < data.length; i++){
        data[i].update("data");
    }
}

/**
 * eucdist() : function untuk menghitung hasil euclidean distance 2 dimensi antar 2 point (x1 & y1 ; x2 & y2)
 * @param a : x1
 * @param b : x2
 * @param c : y1
 * @param d : y2
 * @returns {number} : euclidean distance
 */

function eucdist(a,b,c,d){
    let x = Math.abs(a-b);
    let y = Math.abs(c-d);
    return Math.sqrt(Math.pow(x,2)+Math.pow(y,2));
}

/**
 * clustpar() : function untuk menghubungkan point dengan centroid terdekat. jarak tersebut dicari dengan euclidean distance.
 *              saat data menemukan centroid terdekat, data akan langsung terhubung dengan centroid tersebut dan akan ditandai
 *              dengan warna yang sama dengan centroid.
 * function context : data membandingkan dirinya terhadap centroid
 * @param data : data
 * @param cluster : centroid/cluster
 * min : nilai terkecil dari semua centroid
 * who : centroid yang paling kecil
 */

function clustpar(data,cluster){
    for(let i=0; i<data.length; i++){
        let count = 0,who = 0;
        let min = Number.MAX_SAFE_INTEGER;
        for(let j=0; j<cluster.length ; j++){
            let euc = eucdist(data[i].x,cluster[j].x,data[i].y,cluster[j].y);
            if(euc<min){
                min = euc;
                data[i].parent = cluster[j].parent;
                data[i].distpar = min;
                who = count;
            }
            count++;
        }
        data[i].setcolor(cluster[who].color);
    }
}

/**
 * moveclust() : function untuk menentukan posisi baru centroid / cluster berdasarkan point yang sudah terhubung.
 *               posisi yang baru diperoleh dari rata-rata semua jarak point yang terhubung ke cluster.
 * @param data : data
 * @param cluster : centroid/cluster
 * sum_x : jumlah semua koordinat x (yang terhubung)
 * sum_y : jumlah semua koordinat y (yang terhubung)
 * cnt : jumlah data yang terhubung
 */

function moveclust(data,cluster){
    for(let i = 0; i < cluster.length; i++){
        let sum_x = 0, sum_y = 0, cnt = 0;
        for(let j = 0; j < data.length; j++){
            if(cluster[i].parent === data[j].parent){
                cnt++;
                sum_x+=data[j].x;
                sum_y+=data[j].y;
            }
        }
        cluster[i].chcoo(sum_x/cnt,sum_y/cnt);
    }
}

function randomWeighted(centerX,centerY,scale,density){
    let angle = random()*2*Math.PI;
    x = random();
    if(x===0) x = 0.01;
    let dis = scale * (Math.pow(x,-1/density) - 1);
    return [centerX + dis * Math.sin(angle), centerY + dis * Math.cos(angle)];
}

/**
 * setup() : function dalam library p5.js. hanya sebagai inisialisasi awal
 */

function setup(){
    /*frameRate(fps) : function untuk menentukan frame yang akan diproses setiap detik.*/
    frameRate(fps);

    createCanvas(windowWidth - 15, windowHeight - 20);
    background(51);
    noiseSeed(millis() * second());
    rectMode(CORNERS);
    stroke(255);
    strokeWeight(20);
    point(mouseX,mouseY);

    /*
    Data Loop 1st variant: inisialisasi data dengan posisi random.
    Data Loop 2nd variant: inisialisasi data dengan posisi random dan memiliki kecenderungan dalam suatu point.
     */
    push();
    for(let i = 0; i < 3; i++) color[i] = 255;
    stroke(255);
    strokeWeight(8);

    //1st variant : random
    // for(let i = 0; i < n; i++){
    //     tempoin[0] = random(10, width - 10);
    //     tempoin[1] = random(10, height - 50);
    //     data[i] = new dataset(tempoin[0],tempoin[1],0);
    //     data[i].setcolor(color);
    //     point(data[i].x, data[i].y);
    // }

    //2nd variant : random with tendency
    let tendency = new Array(k),scale = [],density = [];
    for(let i = 0; i < tendency.length; i++) tendency[i] = new Array(2);
    for(let i = 0; i < k; i++){
        tendency[i][0] = random(width/k, width/k*(k-1));
        tendency[i][1] = random(height/(k+2), height/(k+2)*(k+1));
        scale[i] = random(150,200);
        density[i] = random(2,5);
    }
    for(let i = 0; i < n; i++){
        let decide = Math.floor(random(0,k));
        tempoin = randomWeighted(tendency[decide][0], tendency[decide][1], scale[decide], density[decide]);
        data[i] = new dataset(tempoin[0],tempoin[1],0);
        data[i].setcolor(color);
        point(data[i].x, data[i].y);
    }
    pop();

    /*
    Cluster Loop 1st variant: inisialisasi Centroid/cluster dengan posisi random.
    Cluster Loop 2nd variant : inisialisasi Centroid/cluster dengan algoritma K-Means++
     */
    push();
    for(let i = 0; i < k; i++){
        for(let j = 0; j < 3; j++) color[j] = random(0, 255);
        tempoin[0] = random(1, width - 1);
        tempoin[1] = random(1, height - 1);
        Kclust[i] = new dataset(tempoin[0], tempoin[1],i+1);

        //pewarnaan centroid
        Kclust[i].setcolor(color);
        stroke(255);
        strokeWeight(20);
        point(Kclust[i].x, Kclust[i].y);

        stroke(color[0], color[1], color[2]);
        strokeWeight(14);
        point(Kclust[i].x, Kclust[i].y);
    }
    pop();
}

/**
 * draw() : function dalam library p5.js. function ini akan dipanggil berulang kali selama berjalan
 */

let bool = true,bool1 = true;
function draw(){
    if(bool){
        bool = false;
        background(51);
        clustpar(data, Kclust);
        updateglobal(data, Kclust);

        //jumlah data yang terhubung di tiap cluster
        for(let i = 0; i < Kclust.length; i++) partition[i] = 0;
        for(let i of data) partition[i.parent-1]++;
        if(!bool1){
            bool1 = true;
            let same = true;
            for(let i=0;i<partition.length;i++) if(partition[i]!==prevpar[i]) same = false;
            if(same){
                console.log("Converged");
                noLoop();
            }
        }

    }else{
        bool = true;
        background(51);
        moveclust(data, Kclust);
        updateglobal(data, Kclust);
        if(bool1){
            bool1 = false;
            for(let i=0;i<partition.length;i++) prevpar[i] = partition[i];
        }
    }

    //menampilkan bar di layar bawah
    let sum = data.length,cnt = 0;
    strokeWeight(0);
    for(let i of Kclust){
        fill(i.color[0],i.color[1],i.color[2]);
        rect(5,height-45,(width*sum/data.length)-5,height-5);
        fill(255);
        textSize(20);
        text(partition[cnt],(width*sum/data.length)-30,height-50);
        sum-=partition[cnt];
        cnt++;
    }
}