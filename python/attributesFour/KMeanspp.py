import pandas as pd
import numpy as np
import sys

df = pd.read_csv('../datasets/IRIS.csv')

data = df.iloc[:, 0:4].values

df['species'] = pd.Categorical(df['species'])
df['species'] = df['species'].cat.codes
yTrue = df['species']

# initialization of K-Means++ seeding centroid
def distance(p1, p2):
    return np.sum((p1 - p2)**2)


def initialize(data, k):

    centroids = []
    centroids.append(data[np.random.randint(
        data.shape[0]), :])

    for c_id in range(k - 1):

        dist = []
        for i in range(data.shape[0]):
            point = data[i, :]
            d = sys.maxsize

            for j in range(len(centroids)):
                temp_dist = distance(point, centroids[j])
                d = min(d, temp_dist)
            dist.append(d)

        # print(dist)

        dist = np.array(dist)
        cummulative_prob = np.cumsum(dist/np.sum(dist))
        r = np.random.random_sample()
        i = 0
        for j, p in enumerate(cummulative_prob):
            if r < p:
                i = j
                break
        next_centroid = data[i, :]
        centroids.append(next_centroid)
    return centroids


centroids = initialize(data, 3)

# initialization process done

print(centroids)

centroids = {
    1: centroids[0],
    2: centroids[1],
    3: centroids[2]
}


def compute_cluster(df, centroids):

    for i in centroids.keys():
        df['distance_from_{}'.format(i)] = (
            np.sqrt(
                (df['sepal_length'] - centroids[i][0]) ** 2
                + (df['sepal_width'] - centroids[i][1]) ** 2
                + (df['petal_length'] - centroids[i][2]) ** 2
                + (df['petal_width'] - centroids[i][3]) ** 2
            )
        )

    distance_from_centroid = ['distance_from_{}'.format(i) for i in centroids.keys()]
    df['closest'] = df.loc[:, distance_from_centroid].idxmin(axis=1)
    df['closest'] = df['closest'].map(lambda x: int(x.lstrip('distance_from_')))

    print(df)
    return df


df = compute_cluster(df, centroids)


def update_centroid(centroids):
    for i in centroids.keys():
        centroids[i][0] = np.mean(df[df['closest'] == i]['sepal_length'])
        centroids[i][1] = np.mean(df[df['closest'] == i]['sepal_width'])
        centroids[i][2] = np.mean(df[df['closest'] == i]['petal_length'])
        centroids[i][3] = np.mean(df[df['closest'] == i]['petal_width'])

    print('Centroids: {}'.format(centroids))
    return centroids


iteration = 1

while True:
    closest_centroids = df['closest'].copy(deep=True)
    centroids = update_centroid(centroids)
    df = compute_cluster(df, centroids)
    iteration += 1
    if closest_centroids.equals(df['closest']):
        break

print(pd.crosstab(yTrue, df['closest']))
print('Iteration: ' + str(iteration))
