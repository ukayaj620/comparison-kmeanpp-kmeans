import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

df = pd.read_csv('../datasets/IRIS.csv')

data = df.iloc[:, 0:2].values

df['species'] = pd.Categorical(df['species'])
df['species'] = df['species'].cat.codes
yTrue = df['species']

centroids = {
    0: data[np.random.randint(150)],
    1: data[np.random.randint(150)],
    2: data[np.random.randint(150)]
}

print('Centroids: {}'.format(centroids))

print(centroids.keys())

fig = plt.figure(figsize=(10, 10))
plt.scatter(df['sepal_length'], df['sepal_width'], color='k')
color_data_point = {0: 'red', 1: 'green', 2: 'blue'}
for i in centroids.keys():
    plt.scatter(x=centroids[i][0], y=centroids[i][1], s=200, color=color_data_point[i])

plt.show()


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
    df['color'] = df['closest'].map(lambda x: color_data_point[x])

    # print(df)
    return df


df = compute_cluster(df, centroids)


def update_centroid(centroids):
    for i in centroids.keys():
        centroids[i][0] = np.mean(df[df['closest'] == i]['sepal_length'])
        centroids[i][1] = np.mean(df[df['closest'] == i]['sepal_width'])

    print('Centroids: {}'.format(centroids))
    return centroids


def visualize(j):
    plt.figure(figsize=(10, 10))
    plt.scatter(df['sepal_length'], df['sepal_width'], color=df['color'], alpha=0.3, edgecolors='k')
    for i in centroids.keys():
        plt.title('iteration-' + str(j))
        plt.scatter(x=centroids[i][0], y=centroids[i][1], s=200, color=color_data_point[i])
    plt.show()

iteration = 0
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
