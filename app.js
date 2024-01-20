"use strict";

// https://api.github.com
// clientId - d9308aacf8b204d361fd
// secretId - 84969aeef73956f4ec9e8716d1840532802bb81b

const GITHUB_API_URL = "https://api.github.com";
const searchUser = document.querySelector(".searchUser");

class GitHubController {
  constructor(githubService, ui) {
    this.githubService = githubService;
    this.ui = ui;
    this.timer = null;
  }

  async handleSearchInput(inputValue) {
    clearTimeout(this.timer);

    if (inputValue.trim() !== "") {

      this.timer = setTimeout(async () => {
        const [userData, reposData] = await Promise.all([
          this.githubService.getUser(inputValue),
          this.githubService.getUserRepos(inputValue)
        ]);
        if (userData.message) {
          setTimeout(() => {
            this.ui.showAlert(userData.message, "alert alert-danger");
          }, 500);
          return;
        }

        setTimeout(() => {
          this.ui.showProfile(userData);
          this.ui.showRepos(reposData);
        }, 500);
      }, 500);
    } else {
      this.ui.clearProfile();
    }
  }
}

class GitHubService {
  constructor(clientId, secretId) {
    this.clientId = clientId;
    this.secretId = secretId;
  }

  async getUser(userName) {
    const response = await fetch(
      `${GITHUB_API_URL}/users/${userName}?client_id=${this.clientId}&client_secret=${this.secretId}`
    );

    const user = await response.json();
    console.log(user);
    return user;
    
  }
  async getUserRepos(userName) {
    const response = await fetch(
      `${GITHUB_API_URL}/users/${userName}/repos?per_page=5&sort=created:desc&client_id=${this.clientId}&client_secret=${this.secretId}`
    );

    const repos = await response.json();

    return repos;
  }
}

class UI {
  constructor() {
    this.profile = document.querySelector(".profile");
    this.reposContainer = document.querySelector(".repos");
    this.alertContainer = document.querySelector(".search");
  }

  showProfile(user) {
    this.profile.innerHTML = `
      <div class="card card-body mb-3">
        <div class="row">
          <div class="col-md-3">
            <img class="img-fluid mb-2" src="${user.avatar_url}">
            <a href="${user.html_url}" target="_blank" class="btn btn-primary btn-block mb-4">View Profile</a>
          </div>
          <div class="col-md-9">
            <span class="badge badge-primary">Public Repos: ${user.public_repos}</span>
            <span class="badge badge-secondary">Public Gists: ${user.public_gists}</span>
            <span class="badge badge-success">Followers: ${user.followers}</span>
            <span class="badge badge-info">Following: ${user.following}</span>
            <br><br>
            <ul class="list-group">
              <li class="list-group-item">Company: ${user.company}</li>
              <li class="list-group-item">Website/Blog: ${user.blog}</li>
              <li class="list-group-item">Location: ${user.location}</li>
              <li class="list-group-item">Member Since: ${user.created_at}</li>
            </ul>
          </div>
        </div>
      </div>
      <div class="repos"></div>
    `;
  }
  showRepos(repos) {
    this.reposContainer.innerHTML = "<h3 class='page-heading mb-3'>Latest Repos</h3>";

    repos.slice(0, 5).forEach((repo) => {
      const repoElement = document.createElement("div");
      repoElement.className = "card card-body mb-2";
      repoElement.innerHTML = `
        <div class="row">
          <div class="col-md-6">
            <strong>${repo.name}</strong>: ${repo.description}
          </div>
          <div class="col-md-6">
            <span class="badge badge-primary">Stars: ${repo.stargazers_count}</span>
            <span class="badge badge-secondary">Watchers: ${repo.watchers_count}</span>
            <span class="badge badge-success">Forks: ${repo.forks_count}</span>
          </div>
        </div>
      `;

      this.reposContainer.appendChild(repoElement);
    });
  }

  clearProfile() {
    this.profile.innerHTML = "";
  }

  showAlert(message, className) {
    const div = document.createElement("div");

    div.className = className;
    div.innerHTML = message;

    this.alertContainer.before(div);

    this.clearAlert(div);
  }

  clearAlert(alert) {
    setTimeout(() => {
      alert.remove();
    }, 3000);
  }
}

const ui = new UI();
const githubService = new GitHubService(
  "7066daab9e52491246d0",
  "51ec9ead350d7436269002da68586084e7d44794"
);
const githubController = new GitHubController(githubService, ui);

searchUser.addEventListener("input", async (e) => {
  const inputValue = e.target.value;
  await githubController.handleSearchInput(inputValue);
});

