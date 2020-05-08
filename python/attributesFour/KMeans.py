import pandas as pd
import numpy as np

df = pd.read_csv('../datasets/IRIS.csv')

data = df.iloc[:, 0:4].values

df['species'] = pd.Categorical(df['species'])
yTrue = df['species']


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
                + (df['petal_length'] - centroids[i][2]) ** 2
                + (df['petal_width'] - centroids[i][3]) ** 2
            )
        )

    distance_from_centroid = ['distance_from_{}'.format(i) for i in centroids.keys()]
    df['closest'] = df.loc[:, distance_from_centroid].idxmin(axis=1)
    df['closest'] = df['closest'].map(lambda x: int(x.lstrip('distance_from_')))
    df['min'] = df.loc[:, distance_from_centroid].min(axis=1)
    wcv_value = wcv(df)
    print('WCV: ' + str(wcv_value))

    return df


def update_centroid(centroids):
    for i in centroids.keys():
        centroids[i][0] = np.mean(df[df['closest'] == i]['sepal_length'])
        centroids[i][1] = np.mean(df[df['closest'] == i]['sepal_width'])
        centroids[i][2] = np.mean(df[df['closest'] == i]['petal_length'])
        centroids[i][3] = np.mean(df[df['closest'] == i]['petal_width'])

    print('Centroids: {}'.format(centroids))
    bcv_value = bcv(centroids)
    print('BCV: ' + str(bcv_value))
    return centroids

sepal_length = np.random.rand(3, 1) * df['sepal_length'].std() + df['sepal_length'].mean()
sepal_width = np.random.rand(3, 1) * df['sepal_width'].std() + df['sepal_width'].mean()
petal_length = np.random.rand(3, 1) * df['petal_length'].std() + df['petal_length'].mean()
petal_width = np.random.rand(3, 1) * df['petal_width'].std() + df['petal_width'].mean()

centroids = {
    0: [sepal_length[0], sepal_width[0], petal_length[0], petal_width[0]],
    1: [sepal_length[1], sepal_width[1], petal_length[1], petal_width[1]],
    2:  [sepal_length[2], sepal_width[2], petal_length[2], petal_width[2]]
}

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

print(pd.crosstab(yTrue, df['closest']))

print('Iteration: ' + str(iteration))