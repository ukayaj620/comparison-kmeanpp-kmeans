/**
 * tempoin : point sementara dalam bentuk array [x,y]
 * data : titik putih
 * csvdata : titik putih dari data csv IRIS
 * Kclust : Centroid / titik pusat cluster
 * color : warna [R,G,B]
 * partition : persentase bar di bawah layar sebagai indikator cluster
 * prevpar : variable partition loop sebelumnya
 * dist : distance of each data from a cluster (used for Kmeans++)
 */
let tempoin = [],data = [], csvdata = [],Kclust = [], color = [], partition = [], prevpar = [];

/**
 * n : jumlah data
 * k : jumlah centroid / cluster
 * t : jumlah titik kumpul
 * fps : frame rate per second
 * datatype : tipe data acak, "group","csv", atau "random"
 * clustertype : tipe clustering, "++" atau "random"
 * csvtype : tipe parameter di csv, "petal" akan menggunakan parameter petal_length dan petal_width,
 *                                  "sepal" akan menggunakan parameter sepal_length dan sepal_width
 * -----nilai ini boleh diubah-----
 */
let n=500,t=9,k=3,fps=2,datatype="csv",clustertype="++",csvtype="petal";

/**
 * updateglobal() : function untuk meng-update gambar tiap proses clustering
 * @param data : []
 * @param cluster : []
 */
function updateglobal(data,cluster){
    for(let i = 0; i < cluster.length; i++) cluster[i].update("cluster");
    for(let i = 0; i < data.length; i++) data[i].update("data");
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
    return Math.sqrt(Math.pow(Math.abs(a-b),2)+Math.pow(Math.abs(c-d),2));
}

/**
 * clustpar() : function untuk menghubungkan point dengan centroid terdekat. jarak tersebut dicari dengan euclidean distance.
 *              saat data menemukan centroid terdekat, data akan langsung terhubung dengan centroid tersebut dan akan ditandai
 *              dengan warna yang sama dengan centroid.
 * function context : data membandingkan dirinya terhadap centroid
 * @param data : []
 * @param cluster : []
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
        data[i].setcolor(cluster[who].color,"");
    }
}

/**
 * moveclust() : function untuk menentukan posisi baru centroid / cluster berdasarkan point yang sudah terhubung.
 *               posisi yang baru diperoleh dari rata-rata semua jarak point yang terhubung ke cluster.
 * @param data : []
 * @param cluster : []
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

/**
 * randomWeighted() : function random point dengan kecenderungan untuk berkumpul di satu point
 * @param centerX : point kecenderungan (koordinat X)
 * @param centerY : point kecenderungan (koordinat Y)
 * @param scale : skala penyebaran point
 * @param density : kepadatan point dalam area tersebut
 */
function randomWeighted(centerX,centerY,scale,density){
    let angle = random()*2*Math.PI;
    x = random();
    if(x===0) x = 0.01;
    let dis = scale * (Math.pow(x,-1/density) - 1);
    return [centerX + dis * Math.sin(angle), centerY + dis * Math.cos(angle)];
}

function preload(){
    loadStrings("IRIS.csv",(list) => {for(let i = 0; i < list.length; i++) csvdata[i] = list[i].split(',');});
}

/**
 * setup() : function dalam library p5.js. hanya sebagai inisialisasi awal
 */
let scaleoff = 25;
function setup(){
    /*frameRate(fps) : function untuk menentukan frame yang akan diproses setiap detik.*/
    frameRate(fps);

    createCanvas(windowWidth, windowHeight -4);
    background(51);
    noiseSeed(millis() * second());
    rectMode(CORNERS);

    /*
    Data Loop 1st variant: inisialisasi data dari csv
    Data Loop 2nd variant: inisialisasi data dengan posisi random dan memiliki kecenderungan dalam suatu point.
    Data Loop 3rd variant: inisialisasi data dengan posisi random.
     */
    for(let i = 0; i < 3; i++) color[i] = 255;
    stroke(255);
    strokeWeight(8);

    push();
    if(datatype==="csv"){
        translate(0,height-scaleoff);
        scale(1,-1);
        //1st variant : csv
        let max = [];

        //getting max value from each parameter (0 - 3)
        for(let i = 0; i < csvdata[0].length-1; i++){
            let list = [];
            for(let j = 1; j < csvdata.length; j++) list[j-1] = csvdata[j][i];
            max[i] = Math.max(...list);
        }

        //choosing 2 parameters based on type
        for(let i = 1; i < csvdata.length; i++)
                data[i - 1] =
                    csvtype==="sepal"?
                        new dataset(csvdata[i][0], csvdata[i][1],  0,width/max[0],(height-scaleoff)/max[1]):
                    csvtype==="petal"?
                        new dataset(csvdata[i][2], csvdata[i][3],  0,width/max[2],(height-scaleoff)/max[3]):0;

        //draws them based on their species
        let incolor = new Array(3);
        for(let j = 0; j < 3; j++){
            incolor[j] = new Array(3);
            for(let l = 0; l < 3; l++) incolor[j][l] = random(0, 255);
        }
        for(let i = 0; i < data.length; i++){
            switch(csvdata[i+1][4]){
                case "Iris-setosa":
                    data[i].setcolor(color,incolor[0]);
                    stroke(incolor[0][0],incolor[0][1],incolor[0][2]);
                    break;
                case "Iris-versicolor":
                    data[i].setcolor(color,incolor[1]);
                    stroke(incolor[1][0],incolor[1][1],incolor[1][2]);
                    break;
                case "Iris-virginica":
                    data[i].setcolor(color,incolor[2]);
                    stroke(incolor[2][0],incolor[2][1],incolor[2][2]);
                    break;
                default:
                    data[i].setcolor(color);
            }
            point(data[i].x, data[i].y);
        }
    }
    else if(datatype==="group"){
        //2nd variant : random with tendency
        let tendency = new Array(t), scale = [], density = [];
        for(let i = 0; i < tendency.length; i++) tendency[i] = new Array(2);
        for(let i = 0; i < t; i++){
            tendency[i][0] = random(width / t*0.5, width / t * (t - 0.5));
            tendency[i][1] = random(height / (t + 1.5), height / (t + 1.5) * (t + 0.5));
            scale[i] = random(100, 200);
            density[i] = random(4, 6);
        }
        for(let i = 0; i < n; i++){
            let decide = Math.floor(random(0, t));
            tempoin = randomWeighted(tendency[decide][0], tendency[decide][1], scale[decide], density[decide]);
            data[i] = new dataset(tempoin[0], tempoin[1], 0);
        }
    }
    else{
        //3rd variant : random
        for(let i = 0; i < n; i++){
            tempoin[0] = random(10, width - 10);
            tempoin[1] = random(10, height - 50);
            data[i] = new dataset(tempoin[0], tempoin[1], 0);
        }
    }
    if(datatype!=="csv"){
        for(let i = 0; i < n; i++){
            data[i].setcolor(color);
            point(data[i].x, data[i].y);
        }
    }

    /*
    Cluster Loop 1st variant : inisialisasi Centroid/cluster dengan posisi random.
    Cluster Loop 2nd variant : inisialisasi Centroid/cluster dengan algoritma K-Means++
     */
    if(clustertype==="++"){
        //2nd variant : using kmeans++

        //selecting 1st cluster : random select from data
        tempoin[0] = Math.floor(random(0, data.length));
        Kclust[0] = new dataset(data[tempoin[0]].x, data[tempoin[0]].y, 1);

        //selecting next cluster
        let raw = new Array(n); //raw has n array
        for(let i = 0; i < n; i++) raw[i] = []; //each n array has k-1 array

        for(let i = 1; i < k; i++){ //starts from cluster 2 to k
            let who = 0, max = 0, cdist = [];
            //euclidean distance of each cluster from a data
            for(let j = 0; j < data.length; j++) raw[j][i - 1] = eucdist(Kclust[i - 1].x, data[j].x, Kclust[i - 1].y, data[j].y);
            for(let j = 0; j < data.length; j++) cdist[j] = Math.min(...raw[j]); //returns the lowest distance from every cluster
            for(let j = 0; j < data.length; j++){
                if(cdist[j] > max){
                    max = cdist[j];
                    who = j;
                }
            }
            Kclust[i] = new dataset(data[who].x, data[who].y, i + 1);
        }
    }
    else{
        //1st variant : random
        for(let i = 0; i < k; i++){
            tempoin[0] = random(1, width - 1);
            tempoin[1] = random(1, height - 1);
            Kclust[i] = new dataset(tempoin[0], tempoin[1], i + 1);
        }
    }
    for(let i = 0; i < k; i++){
        for(let j = 0; j < 3; j++) color[j] = random(0, 255);

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
    push();
    if(datatype==="csv"){
        translate(0, height - scaleoff);
        scale(1, -1);
    }
    if(bool){
        bool = false;
        background(51);
        clustpar(data, Kclust);
        updateglobal(data, Kclust);

        //jumlah data yang terhubung di tiap cluster
        for(let i = 0; i < Kclust.length; i++) partition[i] = 0;
        for(let i of data) partition[i.parent-1]++;

        //menentukan status konvergensi
        if(!bool1){
            bool1 = true;
            let same = true;
            for(let i=0;i<partition.length;i++) if(partition[i]!==prevpar[i]) same = false;
            if(same){
                console.log("Converged");
                noLoop();
            }
        }

    }
    else{
        bool = true;
        background(51);
        moveclust(data, Kclust);
        updateglobal(data, Kclust);

        //menentukan status konvergensi
        if(bool1){
            bool1 = false;
            for(let i=0;i<partition.length;i++) prevpar[i] = partition[i];
        }
    }
    pop();

    //menampilkan bar di layar bawah
    let sum = data.length,cnt = 0;
    strokeWeight(0);
    for(let i of Kclust){
        fill(i.color[0],i.color[1],i.color[2]);
        rect(0,height-45,(width*sum/data.length)-1,height);
        fill(255);
        textSize(20);
        text(partition[cnt],(width*sum/data.length)-40,height-50);
        sum-=partition[cnt];
        cnt++;
    }
}