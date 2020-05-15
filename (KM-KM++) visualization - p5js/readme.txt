untuk mengganti parameter, edit file Kmeans.js dengan notepad dan hanya ubah variable di inisialisasi variabel ke dua seperti di bawah.
untuk menjalankan filenya, klik "run.bat", command prompt akan muncul untuk menjalankan filenya di browser

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