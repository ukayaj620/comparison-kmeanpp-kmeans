import pandas as pd
import numpy as np
import sys
import matplotlib.pyplot as plt

df = pd.read_csv('../datasets/IRIS.csv')

data = df.iloc[:, 0:2].values

df['species'] = pd.Categorical(df['species'])
yTrue = df['species']

color_data_point = {0: 'red', 1: 'green', 2: 'blue'}

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

        dist = np.array(dist)
        dist_prob = dist/np.sum(dist)
        next_centroid = data[np.argmax(dist_prob), :]
        centroids.append(next_centroid)
    return centroids


def wcv(df):
    wcv_value = 0
    for index, row in df.iterrows():
        wcv_value += row['min'] ** 2

    return wcv_value


def bcv(centroids):

    bcv_value = 0
    for i in centroids.keys():
        for j in centroids.keys():
            if i < j:
                distance = 0
                for k in range(0, len(centroids[i])):
                    distance += (centroids[i][k] - centroids[j][k]) ** 2
                bcv_value += np.sqrt(distance)

    return bcv_value


def compute_cluster(df, centroids):

    for i in centroids.keys():
        df['distance_from_{}'.format(i)] = (
            np.sqrt(
                (df['sepal_length'] - centroids[i][0]) ** 2
                + (df['sepal_width'] - centroids[i][1]) ** 2
            )
        )

    distance_from_centroid = ['distance_from_{}'.format(i) for i in centroids.keys()]
    df['closest'] = df.loc[:, distance_from_centroid].idxmin(axis=1)
    df['closest'] = df['closest'].map(lambda x: int(x.lstrip('distance_from_')))
    df['min'] = df.loc[:, distance_from_centroid].min(axis=1)
    wcv_value = wcv(df)
    print('WCV: ' + str(wcv_value))
    df['color'] = df['closest'].map(lambda x: color_data_point[x])
    # print(df)
    return df


def update_centroid(centroids):
    for i in centroids.keys():
        centroids[i][0] = np.mean(df[df['closest'] == i]['sepal_length'])
        centroids[i][1] = np.mean(df[df['closest'] == i]['sepal_width'])

    print('Centroids: {}'.format(centroids))
    bcv_value = bcv(centroids)
    print('BCV: ' + str(bcv_value))
    return centroids


def visualize(j):
    plt.figure(figsize=(10, 10))
    plt.scatter(df['sepal_length'], df['sepal_width'], color=df['color'], alpha=0.3, edgecolors='k')
    for i in centroids.keys():
        plt.title('iteration-' + str(j))
        plt.scatter(x=centroids[i][0], y=centroids[i][1], s=200, color=color_data_point[i])
    plt.show()

# METHOD

# INITIALIZATION
centroids = initialize(data, 3)

centroids = {
    0: centroids[0],
    1: centroids[1],
    2: centroids[2]
}

fig = plt.figure(figsize=(10, 10))
plt.scatter(df['sepal_length'], df['sepal_width'], color='k')
for i in centroids.keys():
    plt.scatter(x=centroids[i][0], y=centroids[i][1], s=200, color=color_data_point[i])

plt.show()

print('Centroids: {}'.format(centroids))
bcv_value = bcv(centroids)
print('BCV: ' + str(bcv_value))
df = compute_cluster(df, centroids)

iteration = 1

while True:
    closest_centroids = df['closest'].copy(deep=True)
    centroids = update_centroid(centroids)
    df = compute_cluster(df, centroids)
    iteration += 1
    if closest_centroids.equals(df['closest']):
        break

visualize(iteration)

print(pd.crosstab(yTrue, df['closest']))

print('Iteration: ' + str(iteration))
