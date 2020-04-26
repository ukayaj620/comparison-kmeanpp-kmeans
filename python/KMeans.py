import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

df = pd.read_csv('../datasets/Mall_Customers.csv')

raw_age = df.iloc[:, [2]].values
raw_annual_spending = df.iloc[:, [4]].values

age = []
annual_spending = []

for i in range(0, 200):
    age.append(raw_age[i, 0])
    annual_spending.append(raw_annual_spending[i, 0])

print(age)
print(annual_spending)

df = pd.DataFrame({
    'x': age,
    'y': annual_spending
})

k = 2
centroid_index = [1, 2]

centroids = {
    1: [age[100], annual_spending[100]],
    2: [age[50], annual_spending[50]],
    3: [age[150], annual_spending[150]],
    4: [age[25], annual_spending[25]]
}

print('Centroids: {}'.format(centroids))

print(centroids.keys())

fig = plt.figure(figsize=(10, 10))
plt.scatter(df['x'], df['y'], color='k')
color_data_point = {1: 'red', 2: 'green', 3: 'blue', 4: 'yellow'}
for i in centroids.keys():
    plt.scatter(x=centroids[i][0], y=centroids[i][1], color=color_data_point[i])

plt.show()


def compute_cluster(df, centroids):

    for i in centroids.keys():
        df['distance_from_{}'.format(i)] = (
            np.sqrt(
                (df['x'] - centroids[i][0]) ** 2
                + (df['y'] - centroids[i][1]) ** 2
            )
        )

    distance_from_centroid = ['distance_from_{}'.format(i) for i in centroids.keys()]
    df['closest'] = df.loc[:, distance_from_centroid].idxmin(axis=1)
    df['closest'] = df['closest'].map(lambda x: int(x.lstrip('distance_from_')))
    df['color'] = df['closest'].map(lambda x: color_data_point[x])

    print(df)
    return df


df = compute_cluster(df, centroids)


def update_centroid(centroids):
    for i in centroids.keys():
        centroids[i][0] = np.mean(df[df['closest'] == i]['x'])
        centroids[i][1] = np.mean(df[df['closest'] == i]['y'])

    print('Centroids: {}'.format(centroids))
    return centroids


def visualize():
    plt.figure(figsize=(10, 10))
    plt.scatter(df['x'], df['y'], color=df['color'], alpha=0.3, edgecolors='k')
    for i in centroids.keys():
        plt.scatter(x=centroids[i][0], y=centroids[i][1], color=color_data_point[i])
    plt.show()


while True:
    closest_centroids = df['closest'].copy(deep=True)
    centroids = update_centroid(centroids)
    df = compute_cluster(df, centroids)
    visualize()
    if closest_centroids.equals(df['closest']):
        break

